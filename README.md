# 春雪食品生产销售分析报告系统

这个项目包含春雪食品生产销售数据分析报告的网页版本和认证服务。

## 项目结构

- `/my-auth-worker`: 认证服务的Cloudflare Worker项目，负责用户登录、注册等功能
- `/public`: 包含静态资源文件

## 子模块

本项目使用Git子模块管理认证服务。初次克隆项目后，请运行以下命令初始化子模块：

```bash
git submodule init
git submodule update
```

## 功能特性

- 用户认证（注册、登录、登出）
- JWT令牌认证
- 邀请码管理
- 符合RESTful API规范的接口设计

## 技术栈

- Cloudflare Workers
- TypeScript
- D1数据库（Cloudflare的SQL数据库）
- bcryptjs（密码加密）
- JWT（JSON Web Token）

## 开发环境设置

### 前置条件

- Node.js 16+
- npm 7+
- Wrangler CLI (`npm install -g wrangler`)

### 安装依赖

```bash
npm install
```

### 配置

1. 修改 `wrangler.toml` 文件中的配置：
   - 更改 `JWT_SECRET` 为安全的密钥
   - 更新数据库ID（可以使用 `wrangler d1 create spring_snow_db` 创建数据库）

### 初始化数据库

```bash
# 创建开发环境数据库
wrangler d1 create spring_snow_db_dev

# 应用数据库架构
wrangler d1 execute spring_snow_db_dev --file=./schema.sql
```

## 开发

### 认证服务

1. 进入认证服务目录：
   ```bash
   cd my-auth-worker
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 运行开发服务器：
   ```bash
   npm run dev
   ```

### 本地开发

```bash
wrangler dev
```

## 部署

### 认证服务部署

1. 进入认证服务目录：
   ```bash
   cd my-auth-worker
   ```

2. 部署到Cloudflare Workers：
   ```bash
   npm run deploy
   ```

## API文档

详细的API文档请参阅 `public/api-docs.md` 文件。

### 主要API端点

- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/validate-invite-code` - 验证邀请码
- `POST /auth/logout` - 退出登录
- `GET /auth/user-info` - 获取用户信息

## 初始账户

系统初始化后会自动创建一个管理员账户：

- 用户名：admin
- 密码：admin123

## 初始邀请码

系统初始化后会自动创建一个邀请码：

- 邀请码：SPRING2023
- 有效期：2023-12-31
- 可用次数：10次

## 环境变量

认证服务需要在Cloudflare Workers设置以下环境变量：

- `JWT_SECRET`: JWT签名密钥

## 安全说明

1. 生产环境部署前请务必修改 `JWT_SECRET`
2. 生产环境应使用HTTPS
3. 密码已使用bcrypt加密存储

## 许可证

版权所有 © 2024 春雪食品