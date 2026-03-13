# Turbo Support Platform

[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](https://nextjs.org/) [![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/repo) [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com/) [![Stream](https://img.shields.io/badge/Stream-005FFF?logo=stream&logoColor=white)](https://getstream.io/)

基于 Turborepo、Next.js 和 Supabase 构建的双端全栈客服与工单系统。

包含独立的管理端和用户端应用，并共享底层的 UI 组件库、数据库调用和鉴权逻辑。采用 Next.js App Router 结合 Supabase RLS（行级安全），并在 Monorepo 中整合了 WebSocket 实时通信与 AI 对话功能。

## 在线预览

- **用户端访问**: [https://turbo-support-platform-user.vercel.app/](https://turbo-support-platform-user.vercel.app/)
  - *用户端账号自行注册*

- **管理后台访问**: [https://turbo-support-platform-admin.vercel.app](https://turbo-support-platform-admin.vercel.app)
  - **admin 用户名**: superadmin@mx
  - **admin 密码**: 123456

## 项目结构

系统采用 Turborepo 划分多块独立的 App 和复用的 Package，在架构上实现物理隔离：

### Apps
- **`apps/admin`**: 管理后台。提供工单处理、客户资料查看、知识库维护及多平台对话回复功能。
- **`apps/user`**: 客户端。提供产品落地页、用户控制台、自主提单，以及包含 AI 智能助手和人工客服接管的实时对话流。

### Packages
- **`packages/database`**: 封装并导出 Supabase Client、TypeScript 类型及核心数据查询。依托 PostgreSQL RLS 实现租户和角色的数据隔离。
- **`packages/ui`**: 基于 Tailwind CSS 和 shadcn/ui 的共享组件库。
- **`packages/auth`**: 跨端通用的用户身份验证机制、中间件与 React Hooks。
- **`packages/support`**: 核心业务支持库，包含 Stream Chat 实时通信逻辑，及预留的大模型对话意图识别接口层。

## 本地开发指南

### 环境依赖
- Node.js >= 18
- pnpm >= 8
- 支持 PostgreSQL RLS 和 Auth 的后端 (如 Supabase 实例)
- 支持 WebSocket 的即时通讯平台 (如 Stream Chat 实例)

### 快速启动

1. **获取代码并安装依赖**
   ```bash
   git clone https://github.com/mx94/turbo-support-platform.git
   cd turbo-support-platform
   pnpm install
   ```

2. **环境变量配置**
   复制示例文件并依次填入本地或远程的云服务密钥：
   ```bash
   cp .env.example .env.local
   ```
   *注意：必须配置项包括 Supabase 的 URL / Anon Key / Service Role Key，以及 Stream 的 Key和 Secret。如需开启 AI 智能问答，还需要配置如 OpenAI 的 API Key 等大模型调用凭证。*

3. **运行开发服务器**
   Turborepo 会分析依赖树并行拉起各个应用：
   ```bash
   pnpm dev
   ```
   默认配置下：
   - 客户端工作台启动在 `http://localhost:3000`
   - 管理后台启动在 `http://localhost:3001`

## 开源协议

[MIT](./LICENSE)
