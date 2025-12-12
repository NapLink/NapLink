// 主类
export { NapLink } from './naplink';

// 类型
export type {
    NapLinkConfig,
    PartialNapLinkConfig,
    Logger,
} from './types/config';

// 连接状态
export { ConnectionState } from './core/connection';

// 错误类型
export {
    NapLinkError,
    ConnectionError,
    ApiTimeoutError,
    ApiError,
    MaxReconnectAttemptsError,
    ConnectionClosedError,
    InvalidConfigError,
} from './types/errors';

// OneBot 协议类型
export * from './types/onebot';
export * from './types/message-segment';

// API
export { OneBotApi } from './api';

// 默认导出
export { NapLink as default } from './naplink';
