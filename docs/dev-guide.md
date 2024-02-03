---
outline: deep
---

# 开发指南

本文将从开发者的角度介绍AOI仓库，并为希望参与AOI项目开发的开发者提供帮助。

## 仓库结构

- `apps` 独立部署的App包
  - `server` 服务器
  - `frontend` 前端
- `docker` Docker相关文件
  - `compose` Docker Compose文件
  - `dockerfiles` Dockerfile文件
- `docs` 文档源码，参见[VitePress](https://vitepress.dev)
- `libs` 通用的库包
  - `common` 共享的一些工具代码与模式
- `scripts` 一些辅助脚本
  - `local` 本地开发脚本，不会被提交

## 代码规范

仓库使用Husky在提交代码时自动执行代码规范检查（代码样式、风格与类型检查）。同时，亦有Github Actions执行CI检查。

参见[Prettier](https://prettier.io)、[ESLint](https://eslint.org)与[TypeScript](https://www.typescriptlang.org)文档了解。

## 设计准则

1. 在基于语义与RESTFul的前提下保持API的简明，需求尽量隔离在前端；
2. 保持代码可读性与自解释性，避免使用非公认的缩写；
3. 代理功能，避免在API服务中实现非通用的业务逻辑。

## 兼容性

::: warning
:warning: 在AOI Sekai (v1.x)版本发布前，不保证API的稳定性和兼容性。
:::

提供基于[Semantic Versioning](https://semver.org)的版本兼容性控制。

## 安全性

团队将会审查所有外部PR，并定期审查代码，确保代码的安全性。同时，我们也欢迎社区的开发者提交安全报告。

漏洞可以通过发送邮件至[`security@fedstack.org`](mailto:security@fedstack.org)与我们联系。

## 贡献指南

若您希望参与AOI项目的开发，您可以：

- 若您发现了问题，但不知道如何解决，您可以在Discussion中询问；
- 若您具备开发能力，能提供完整的错误发生的环境并可以复现，您可以提交Issue；
- 若您还具备修复问题的能力，您可以提交PR解决之；
- 除此之外，我们亦欢迎文档的维护者。
