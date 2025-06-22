# 春雪食品生产销售分析报告

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

## 环境变量

认证服务需要在Cloudflare Workers设置以下环境变量：

- `JWT_SECRET`: JWT签名密钥

## 许可证

版权所有 © 2024 春雪食品 