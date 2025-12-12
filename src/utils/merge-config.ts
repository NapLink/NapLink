import type { NapLinkConfig, PartialNapLinkConfig } from '../types/config';
import { DEFAULT_CONFIG } from '../types/config';
import { InvalidConfigError } from '../types/errors';

/**
 * 合并用户配置与默认配置，校验必填项。
 */
export function mergeConfig(userConfig: PartialNapLinkConfig): NapLinkConfig {
    if (!userConfig.connection?.url) {
        throw new InvalidConfigError('connection.url', '必须提供连接URL');
    }

    return {
        connection: {
            url: userConfig.connection.url,
            token: userConfig.connection.token,
            timeout: userConfig.connection.timeout ?? 30000,
            pingInterval: userConfig.connection.pingInterval ?? 30000,
            heartbeatAction: userConfig.connection.heartbeatAction ?? {
                action: 'get_status',
                params: {},
            },
        },
        reconnect: {
            enabled: userConfig.reconnect?.enabled ?? DEFAULT_CONFIG.reconnect.enabled,
            maxAttempts:
                userConfig.reconnect?.maxAttempts ?? DEFAULT_CONFIG.reconnect.maxAttempts,
            backoff: {
                initial:
                    userConfig.reconnect?.backoff?.initial ??
                    DEFAULT_CONFIG.reconnect.backoff.initial,
                max:
                    userConfig.reconnect?.backoff?.max ??
                    DEFAULT_CONFIG.reconnect.backoff.max,
                multiplier:
                    userConfig.reconnect?.backoff?.multiplier ??
                    DEFAULT_CONFIG.reconnect.backoff.multiplier,
            },
        },
        logging: {
            level: userConfig.logging?.level ?? DEFAULT_CONFIG.logging.level,
            logger: userConfig.logging?.logger,
        },
        api: {
            timeout: userConfig.api?.timeout ?? DEFAULT_CONFIG.api.timeout,
            retries: userConfig.api?.retries ?? DEFAULT_CONFIG.api.retries,
        },
    };
}
