# Turbo Support Platform - Admin App

管理后台应用。基于 Next.js App Router 构建。

## 功能特性

- **客服工作台**: 集中展示等待接入和处理中的客户对话。
- **工单管理**: 全局工单流转、状态更新及跟进记录。
- **知识库管理**: 编辑和维护产品使用文档，可作为 AI 的知识源检索池。
- **用户画像**: 查看并管理客户信息。
- **多租户权限控制**: 基于底层 Supabase RLS 保障不同产品线及角色的数据隔离。

## 开发与运行

默认情况下，管理端服务会运行在 `3001` 端口。

如果独立运行此包：

```bash
cd apps/admin
pnpm dev
# 或在根目录使用 pnpm dev --filter @repo/admin
```

浏览器打开 [http://localhost:3001](http://localhost:3001)。

## 依赖关系

依赖 Monorepo 中 `packages/` 目录下的：
- `@repo/ui` 
- `@repo/database`
- `@repo/auth`
- `@repo/support`
