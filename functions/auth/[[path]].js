// 直接集成认证逻辑，避免代理
// 使用Web Crypto API替代bcryptjs

// 密码哈希函数
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 密码验证函数
async function verifyPassword(password, hashedPassword) {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}

// 定义统一响应格式
function createResponse(code, message, data = null) {
  const responseBody = {
    code,
    message,
    data
  };
  
  return new Response(JSON.stringify(responseBody), {
    status: code >= 200 && code < 300 ? code : 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  
  // 处理CORS预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      }
    });
  }
  
  const url = new URL(request.url);
  const path = url.pathname;
  
  try {
    // 路由处理
    if (path === '/auth/validate-invite-code' && request.method === 'POST') {
      return await handleValidateInviteCode(request, env);
    } else if (path === '/auth/register' && request.method === 'POST') {
      return await handleRegister(request, env);
    } else if (path === '/auth/login' && request.method === 'POST') {
      return await handleLogin(request, env);
    } else if (path === '/auth/logout' && request.method === 'POST') {
      return await handleLogout(request, env);
    } else if (path === '/auth/user-info' && request.method === 'GET') {
      return await handleUserInfo(request, env);
    } else {
      return createResponse(404, '请求的资源不存在');
    }
  } catch (error) {
    console.error('请求处理错误:', error);
    return createResponse(500, '服务器内部错误');
  }
}

// 邀请码验证处理
async function handleValidateInviteCode(request, env) {
  try {
    const data = await request.json();
    const { inviteCode } = data;

    if (!inviteCode) {
      return createResponse(400, '邀请码为必填项');
    }

    // 验证邀请码
    const inviteCodeValid = await env.DB.prepare(
      'SELECT * FROM invite_codes WHERE code = ? AND status = "active" AND (max_uses > used OR max_uses = -1) AND (expire_date IS NULL OR expire_date >= CURRENT_DATE)'
    ).bind(inviteCode).first();
    
    if (!inviteCodeValid) {
      return createResponse(200, '邀请码无效', { valid: false });
    }

    return createResponse(200, '邀请码有效', { valid: true });
  } catch (error) {
    console.error('邀请码验证错误:', error);
    return createResponse(500, '服务器内部错误');
  }
}

// 注册处理
async function handleRegister(request, env) {
  try {
    const data = await request.json();
    const { username, password, inviteCode } = data;

    if (!username || !password || !inviteCode) {
      return createResponse(400, '用户名、密码和邀请码为必填项');
    }
    
    // 用户名长度检查
    if (username.length < 3 || username.length > 20) {
      return createResponse(400, '用户名长度应为3-20个字符');
    }
    
    // 密码强度检查
    if (password.length < 6) {
      return createResponse(400, '密码长度不能少于6位');
    }

    // 验证邀请码
    const inviteCodeValid = await env.DB.prepare(
      'SELECT * FROM invite_codes WHERE code = ? AND status = "active" AND (max_uses > used OR max_uses = -1) AND (expire_date IS NULL OR expire_date >= CURRENT_DATE)'
    ).bind(inviteCode).first();
    
    if (!inviteCodeValid) {
      return createResponse(400, '邀请码无效或已过期');
    }

    // 检查用户是否已存在
    const existingUser = await env.DB.prepare('SELECT id FROM users WHERE username = ?')
                                     .bind(username)
                                     .first();
    if (existingUser) {
      return createResponse(409, '该用户名已被注册');
    }

    // 使用Web Crypto API哈希密码
    const hashedPassword = await hashPassword(password);

    // 生成头像字符
    const avatar = username.charAt(0).toUpperCase();

    // 生成用户ID
    const userId = crypto.randomUUID();
    
    // 插入新用户到数据库
    await env.DB.prepare('INSERT INTO users (id, username, password, avatar, roles, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)')
                .bind(userId, username, hashedPassword, avatar, JSON.stringify(["user"]))
                .run();

    // 更新邀请码使用次数
    await env.DB.prepare('UPDATE invite_codes SET used = used + 1 WHERE code = ?')
                .bind(inviteCode)
                .run();

    // 生成简单的token（在生产环境中应使用JWT）
    const token = btoa(JSON.stringify({ userId, username, exp: Date.now() + 24 * 60 * 60 * 1000 }));

    return createResponse(200, '注册成功', {
      token,
      user: {
        id: userId,
        username,
        avatar,
        roles: ["user"]
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
    return createResponse(500, '服务器内部错误');
  }
}

// 登录处理
async function handleLogin(request, env) {
  try {
    const data = await request.json();
    const { username, password } = data;

    if (!username || !password) {
      return createResponse(400, '用户名和密码为必填项');
    }

    // 在数据库中查找用户
    const user = await env.DB.prepare(
        'SELECT id, username, password, avatar, roles FROM users WHERE username = ?'
      )
      .bind(username)
      .first();

    if (!user) {
      return createResponse(401, '用户名或密码无效');
    }

    // 验证密码是否匹配
    const passwordMatch = await verifyPassword(password, user.password);

    if (!passwordMatch) {
      return createResponse(401, '用户名或密码无效');
    }

    // 解析角色
    const roles = JSON.parse(user.roles);

    // 更新最后登录时间
    await env.DB.prepare('UPDATE users SET last_login_time = CURRENT_TIMESTAMP WHERE id = ?')
                .bind(user.id)
                .run();

    // 生成简单的token
    const token = btoa(JSON.stringify({ userId: user.id, username: user.username, exp: Date.now() + 24 * 60 * 60 * 1000 }));

    return createResponse(200, '登录成功', {
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        roles: roles
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    return createResponse(500, '服务器内部错误');
  }
}

// 退出登录处理
async function handleLogout(request, env) {
  return createResponse(200, '退出成功', null);
}

// 获取用户信息处理
async function handleUserInfo(request, env) {
  try {
    // 从请求头获取token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createResponse(401, '未授权，请先登录');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // 解析token
      const tokenData = JSON.parse(atob(token));
      
      // 检查token是否过期
      if (Date.now() > tokenData.exp) {
        return createResponse(401, 'token已过期，请重新登录');
      }
      
      // 从数据库获取最新的用户信息
      const user = await env.DB.prepare(
        'SELECT id, username, avatar, email, roles, last_login_time FROM users WHERE id = ?'
      )
      .bind(tokenData.userId)
      .first();

      if (!user) {
        return createResponse(404, '用户不存在');
      }

      // 解析角色
      const roles = JSON.parse(user.roles);

      return createResponse(200, '获取成功', {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
        roles: roles,
        lastLoginTime: user.last_login_time
      });
    } catch (err) {
      return createResponse(401, 'token已过期或无效，请重新登录');
    }
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return createResponse(500, '服务器内部错误');
  }
}