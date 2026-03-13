# Turbo Support Platform - User App

用户客户端应用。基于 Next.js App Router 构建。

## 功能特性

- **产品落地页**: 展示 SaaS 基础设施服务及核心特性。
- **用户控制台**: 供 C 端或小 B 端登录查看自己的工单及服务请求纪录。
- **智能客服 (AI Chat)**: 融合预置了知识库内容的大语言模型对话流，提供第一层级的自助解答。
- **人工客服接管**: 当机器人无法解决问题时，无缝切换到真人 Stream Chat 对话模式。
- **自主提单**: 标准化工单提交表单及进度查询。

## 开发与运行

默认情况下，客户端服务会运行在 `3000` 端口。

如果独立运行此包：

```bash
cd apps/user
pnpm dev
# 或在根目录使用 pnpm dev --filter @repo/user
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 依赖关系

依赖 Monorepo 中 `packages/` 目录下的：
- `@repo/ui` 
- `@repo/database`
- `@repo/auth`
- `@repo/support`
