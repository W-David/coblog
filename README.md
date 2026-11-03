# coblog

个人博客 **后端 API**（Koa2 + Sequelize + MySQL）。

线上站点：[https://coblog.fun](https://coblog.fun)  
配套前端：[W-David/coblog-vite](https://github.com/W-David/coblog-vite)  
评论服务：[W-David/coblog-waline](https://github.com/W-David/coblog-waline)（Vercel Waline；本仓 `waline/`、`waline_server/` 为历史自建方案遗留）

## 角色

- 提供 `/api/v1`：文章、分类、标签、用户/管理员、搜索、上传、阿里云 OSS 等
- 默认监听 **8990**（开发 HTTP；生产可走 HTTPS，见 `app.js`）
- 前端通过 `VITE_APP_BASE_URL`（如 `https://coblog.fun:8990/api/v1`）调用本服务

## 本地运行

```bash
# 1. 安装依赖
yarn # 或 npm install

# 2. 配置：复制私有配置（勿提交真实密钥）
#    config/config.js 已被 .gitignore；可参考 config/remote-config.js 与 .env.example
cp config/remote-config.js config/config.js
# 按需修改 database / security / alioss

# 3. 开发
yarn dev
# -> http://localhost:8990

# 4. 生产（PM2）
yarn start
yarn stop
yarn log
```

## 环境说明

| 变量 / 配置 | 说明 |
|-------------|------|
| `NODE_ENV` | `dev` / `prod` |
| MySQL | 见 `config` 中 `database` |
| JWT `security.secretKey` | 生产务必换成强随机值 |
| `ssl/` | 生产证书目录，已在 `.gitignore`，勿提交 |

## 仓库关系（勿合并）

```
coblog-vite  (前端 SPA)
    |  API
coblog       (本仓，后端)
    |
coblog-waline (评论，独立部署)
```
