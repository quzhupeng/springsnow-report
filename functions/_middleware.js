// 中间件：确保数据库表存在
export async function onRequest(context) {
  const { env } = context;
  
  // 确保数据库表存在
  if (env.DB) {
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
      
      // 创建默认邀请码（如果不存在）
      await env.DB.prepare(`
        INSERT OR IGNORE INTO invite_codes (code, max_uses, status, expire_date)
        VALUES ('SPRING2024', 10, 'active', '2024-12-31')
      `).run();
      
    } catch (error) {
      console.error('数据库初始化错误:', error);
    }
  }
  
  // 继续处理请求
  return await context.next();
}