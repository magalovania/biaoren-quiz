# Render 部署指南

## 部署步骤

### 1. 准备 Render 账号
- 访问 https://render.com 注册账号
- 可以使用 GitHub 账号登录

### 2. 创建 Static Site
1. 登录后，点击 "New" → "Static Site"
2. 连接到你的 GitHub 仓库

### 3. 配置部署信息

| 字段 | 填写内容 |
|------|----------|
| **Name** | `biaoren-quiz` |
| **Branch** | `main` |
| **Build Command** | (留空，静态网站不需要) |
| **Publish directory** | `.` (根目录，因为 index.html 在根目录) |

### 4. 点击 "Create Static Site"

等待部署完成后，Render 会提供一个免费的 `.onrender.com` 域名。

## 注意事项

- Render 免费版的静态网站有流量限制
- 首次部署可能需要 1-2 分钟
- 每次 push 到 GitHub 会自动触发部署

## 自定义域名（可选）

如果你有域名：
1. 在 Render 控制台点击你的网站
2. 进入 "Settings" → "Custom Domains"
3. 添加你的域名并按照提示配置 DNS 记录
