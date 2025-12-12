/**
 * NapLink 配置接口
 * 提供完整的配置选项，所有参数都有合理的默认值
 */
export interface NapLinkConfig {
    /** 连接配置 */
    connection: {
        /** WebSocket 服务器 URL */
        url: string;
        /** 访问令牌（可选） */
        token?: string;
        /** 连接超时时间（毫秒） */
        timeout?: number;
        /** 心跳间隔（毫秒，0表示禁用） */
        pingInterval?: number;
        /** 自定义心跳动作（默认 get_status） */
        heartbeatAction?: {
            action: string;
            params?: Record<string, any>;
        };
    };

    /** 重连配置 */
    reconnect: {
        /** 是否启用自动重连 */
        enabled: boolean;
        /** 最大重连次数 */
        maxAttempts: number;
        /** 指数退避配置 */
        backoff: {
            /** 初始延迟（毫秒） */
            initial: number;
            /** 最大延迟（毫秒） */
            max: number;
            /** 退避倍数 */
            multiplier: number;
        };
    };

    /** 日志配置 */
    logging: {
        /** 日志等级 */
        level: 'debug' | 'info' | 'warn' | 'error' | 'off';
        /** 自定义logger（可选） */
        logger?: Logger;
    };

    /** API配置 */
    api: {
        /** API调用超时时间（毫秒） */
        timeout: number;
        /** 失败重试次数 */
        retries: number;
    };
}

/**
 * 日志接口
 * 允许用户提供自定义logger实现
 */
export interface Logger {
    debug(message: string, ...meta: any[]): void;
    info(message: string, ...meta: any[]): void;
    warn(message: string, ...meta: any[]): void;
    error(message: string, error?: Error, ...meta: any[]): void;
}

/**
 * 部分配置类型（用于构造函数）
 * 用户只需提供必要的配置，其他使用默认值
 */
export type PartialNapLinkConfig = {
    connection: {
        url: string;
        token?: string;
        timeout?: number;
        pingInterval?: number;
        heartbeatAction?: {
            action: string;
            params?: Record<string, any>;
        };
    };
    reconnect?: Partial<NapLinkConfig['reconnect']>;
    logging?: Partial<NapLinkConfig['logging']>;
    api?: Partial<NapLinkConfig['api']>;
};

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: Omit<NapLinkConfig, 'connection'> = {
    reconnect: {
        enabled: true,
        maxAttempts: 10,
        backoff: {
            initial: 1000,
            max: 60000,
            multiplier: 2,
        },
    },
    logging: {
        level: 'info',
    },
    api: {
        timeout: 30000,
        retries: 3,
    },
};
