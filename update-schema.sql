-- 更新users表，添加缺失的字段
ALTER TABLE users ADD COLUMN avatar TEXT;
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN roles TEXT NOT NULL DEFAULT '["user"]';
ALTER TABLE users ADD COLUMN last_login_time TIMESTAMP;

-- 创建管理员用户（如果不存在）
INSERT OR IGNORE INTO users (id, username, password, avatar, roles)
VALUES (
  1,
  'admin',
  '$2a$10$zPRbmAYYaAGDMwbJr7wJxuAeKnD7N9SRzqiJxmIJJIUjAdNxIH.Oa',
  'A',
  '["user","admin"]'
);

-- 创建邀请码表
CREATE TABLE IF NOT EXISTS invite_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  expire_date TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 创建初始邀请码
INSERT OR IGNORE INTO invite_codes (code, max_uses, status, expire_date, created_by)
VALUES (
  'SPRING2023',
  10,
  'active',
  '2023-12-31',
  1
); 