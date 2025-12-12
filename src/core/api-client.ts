import type { Logger } from '../types/config';
import type { NapLinkConfig } from '../types/config';
import { ApiError, ConnectionClosedError } from '../types/errors';
import type { ConnectionManager } from './connection';
import { buildRequestPayload } from './api/request-builder';
import { ResponseRegistry } from './api/response-registry';
import { withRetry } from './api/retry';

/**
 * API客户端
 * 负责发送API请求并处理响应
 * 支持超时控制、自动重试、请求清理
 */
export class ApiClient {
    private readonly registry = new ResponseRegistry();
    private cleanupTimer?: NodeJS.Timeout | number;
    private requestIdCounter = 0;

    constructor(
        private connection: ConnectionManager,
        private config: NapLinkConfig,
        private logger: Logger
    ) {
        this.startCleanupTimer();
    }

    /**
     * 调用API
     * @param method API方法名
     * @param params API参数
     * @param options 调用选项
     */
    async call<T = any>(
        method: string,
        params: any = {},
        options?: { timeout?: number; retries?: number }
    ): Promise<T> {
        const timeout = options?.timeout ?? this.config.api.timeout;
        const retries = options?.retries ?? this.config.api.retries;

        return withRetry(
            () => this.sendRequest<T>(method, params, timeout),
            retries,
            method,
            this.logger,
            this.delay.bind(this)
        );
    }

    /**
     * 处理API响应
     * 由连接管理器调用
     */
    handleResponse(echo: string, response: any): void {
        const request = this.registry.take(echo);
        if (!request) {
            this.logger.warn(`收到未知请求的响应: ${echo}`);
            return;
        }

        // 检查响应状态
        if (response.status === 'ok' || response.retcode === 0) {
            this.logger.debug(`API成功: ${request.method}`);
            request.resolve(response.data);
        } else {
            this.logger.warn(`API失败: ${request.method}`, {
                retcode: response.retcode,
                message: response.message,
            });
            request.reject(
                new ApiError(
                    request.method,
                    response.retcode,
                    response.message,
                    response.wording
                )
            );
        }
    }

    /**
     * 销毁API客户端
     */
    destroy(): void {
        // 清理所有待处理的请求
        this.registry.clearAll('API客户端已销毁');

        // 停止清理定时器
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer as NodeJS.Timeout);
            this.cleanupTimer = undefined;
        }
    }

    /**
     * 发送API请求
     */
    private sendRequest<T>(
        method: string,
        params: any,
        timeout: number
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const echo = this.generateRequestId();

            this.logger.debug(`发送API请求: ${method}`, { echo, params });

            // 设置超时定时器
            this.registry.add(
                echo,
                {
                    resolve,
                    reject,
                    createdAt: Date.now(),
                    method,
                },
                timeout
            );

            // 发送请求
            try {
                if (!this.connection.isConnected()) {
                    throw new ConnectionClosedError(-1, '连接未建立，请先调用 connect()');
                }
                const { payload } = buildRequestPayload(method, params, echo);
                this.connection.send(payload);
            } catch (error) {
                this.registry.reject(echo, error as Error);
                reject(error);
            }
        });
    }

    /**
     * 延迟
     */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * 生成请求ID
     */
    private generateRequestId(): string {
        return `naplink_${Date.now()}_${this.requestIdCounter++}`;
    }

    /**
     * 启动清理定时器
     * 定期清理超时的待处理请求
     */
    private startCleanupTimer(): void {
        this.cleanupTimer = setInterval(() => {
            const now = Date.now();
            const timeout = this.config.api.timeout;

            this.registry.cleanupStale(now, timeout * 2, (method, echo) => {
                this.logger.warn(`清理超时请求: ${method}`, { echo });
            });
        }, 60000); // 每分钟清理一次
    }
}
