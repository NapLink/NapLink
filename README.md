# NapLink

> 现代化的 NapCat WebSocket TypeScript/JavaScript 客户端 SDK

[![npm](https://img.shields.io/npm/v/@naplink/naplink?logo=npm)](https://www.npmjs.com/package/@naplink/naplink)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Documentation](https://img.shields.io/badge/docs-naplink.github.io-blue)](https://naplink.github.io/)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

## ✨ 特性

- 🚀 **现代化设计** - TypeScript + ES2022，完整类型定义
- 🔄 **智能重连** - 指数退避重连机制，自动故障恢复
- ⏱️ **超时控制** - API 调用和连接超时保护
- 🎯 **事件驱动** - 完整的 OneBot 11 事件支持
- 📊 **完善日志** - 分级日志系统，支持自定义 logger
- 💪 **稳定可靠** - 自动心跳检测，零运行时依赖

## 📚 文档

完整文档请访问：**[https://naplink.github.io/](https://naplink.github.io/)**

- [快速开始](https://naplink.github.io/guide/getting-started) - 5分钟上手
- [API 文档](https://naplink.github.io/api/naplink) - 完整 API 参考
- [配置选项](https://naplink.github.io/guide/configuration) - 详细配置说明
- [事件处理](https://naplink.github.io/guide/events) - 事件系统详解
- [最佳实践](https://naplink.github.io/guide/best-practices) - 生产环境建议
- [架构设计](https://naplink.github.io/guide/architecture) - 内部实现
- 最佳实践项目：[NapGram](https://github.com/NapGram/NapGram) - 基于 NapLink 的 QQ ↔ Telegram 消息桥接

## 📦 安装

```bash
pnpm add naplink
```

## 🔧 配置示例

```typescript
const client = new NapLink({
  connection: {
    url: 'ws://localhost:3001',
    timeout: 30000,        // 连接超时
    pingInterval: 30000,   // 心跳间隔
  },
  reconnect: {
    enabled: true,         // 启用自动重连
    maxAttempts: 10,       // 最大重连次数
  },
  logging: {
    level: 'info',         // 日志级别
  },
  api: {
    timeout: 30000,        // API 超时
    retries: 3,            // 重试次数
  },
});
```

更多配置选项请查看 [配置文档](https://naplink.github.io/guide/configuration)。

## 🏗️ 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 类型检查
pnpm typecheck
```

## 📄 许可证

[MIT](./LICENSE)

## 🙏 致谢

- [NapCat](https://napneko.github.io/) - 优秀的 QQ Bot 框架
- [OneBot 11](https://github.com/botuniverse/onebot-11) - 标准化 Bot 协议
- [node-napcat-ts](https://github.com/HkTeamX/node-napcat-ts) - 灵感来源

**NapLink** - 让 NapCat 开发更简单 ✨
