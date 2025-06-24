// 数据库初始化页面
export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'POST') {
    try {
      // 创建用户表
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          avatar TEXT,
          email TEXT,
          roles TEXT NOT NULL DEFAULT '["user"]',
          last_login_time TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      
      // 创建邀请码表
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS invite_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL UNIQUE,
          max_uses INTEGER NOT NULL DEFAULT 1,
          used INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'active',
          expire_date TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_by TEXT,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `).run();
      
      // 创建默认邀请码
      await env.DB.prepare(`
        INSERT OR IGNORE INTO invite_codes (code, max_uses, status, expire_date)
        VALUES ('SPRING2024', 10, 'active', '2024-12-31')
      `).run();
      
      // 创建管理员用户（密码: admin123）
      const adminPasswordHash = await hashPassword('admin123');
      await env.DB.prepare(`
        INSERT OR IGNORE INTO users (id, username, password, avatar, roles, created_at)
        VALUES ('admin-001', 'admin', ?, 'A', '["user","admin"]', CURRENT_TIMESTAMP)
      `).bind(adminPasswordHash).run();
      
      return new Response(JSON.stringify({
        success: true,
        message: '数据库初始化成功'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        message: '数据库初始化失败: ' + error.message
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // GET请求返回初始化页面
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>数据库初始化</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            button { padding: 15px 30px; font-size: 16px; }
            .result { margin: 20px 0; padding: 15px; background: #f5f5f5; }
        </style>
    </head>
    <body>
        <h1>数据库初始化</h1>
        <p>点击下面的按钮初始化数据库表和默认数据：</p>
        <button onclick="initDatabase()">初始化数据库</button>
        <div id="result" class="result" style="display: none;"></div>
        
        <script>
            async function hashPassword(password) {
              const encoder = new TextEncoder();
              const data = encoder.encode(password);
              const hashBuffer = await crypto.subtle.digest('SHA-256', data);
              const hashArray = Array.from(new Uint8Array(hashBuffer));
              return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
            
            async function initDatabase() {
                try {
                    const response = await fetch('/init-db', {
                        method: 'POST'
                    });
                    const data = await response.json();
                    const resultDiv = document.getElementById('result');
                    resultDiv.style.display = 'block';
                    resultDiv.innerHTML = data.success ? 
                        '<span style="color: green;">✓ ' + data.message + '</span>' :
                        '<span style="color: red;">✗ ' + data.message + '</span>';
                } catch (error) {
                    const resultDiv = document.getElementById('result');
                    resultDiv.style.display = 'block';
                    resultDiv.innerHTML = '<span style="color: red;">✗ 错误: ' + error.message + '</span>';
                }
            }
        </script>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// 密码哈希函数
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}