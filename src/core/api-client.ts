import type { Logger } from '../types/config';
import type { NapLinkConfig } from '../types/config';
import { ApiError, ConnectionClosedError } from '../types/errors';
import type { ConnectionManager } from './connection';
import { buildRequestPayload } from './api/request-builder';
import { ResponseRegistry } from './api/response-registry';
import { withRetry } from './api/retry';

type AsyncQueueWaiter<T> = {
    resolve: (result: IteratorResult<T>) => void;
    reject: (error: Error) => void;
};

class AsyncQueue<T> implements AsyncIterable<T>, AsyncIterator<T> {
    private values: T[] = [];
    private waiters: AsyncQueueWaiter<T>[] = [];
    private closed = false;

    push(value: T) {
        if (this.closed) return;
        const waiter = this.waiters.shift();
        if (waiter) {
            waiter.resolve({ value, done: false });
        } else {
            this.values.push(value);
        }
    }

    close() {
        if (this.closed) return;
        this.closed = true;
        while (this.waiters.length) {
            this.waiters.shift()!.resolve({ value: undefined as any, done: true });
        }
    }

    fail(error: Error) {
        if (this.closed) return;
        this.closed = true;
        while (this.waiters.length) {
            this.waiters.shift()!.reject(error);
        }
        this.values = [];
    }

    async next(): Promise<IteratorResult<T>> {
        if (this.values.length) {
            return { value: this.values.shift()!, done: false };
        }
        if (this.closed) {
            return { value: undefined as any, done: true };
        }
        return await new Promise<IteratorResult<T>>((resolve, reject) => {
            this.waiters.push({
                resolve,
                reject: (err) => reject(err),
            });
        });
    }

    [Symbol.asyncIterator](): AsyncIterator<T> {
        return this;
    }
}

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
     * 调用流式 API（NapCat stream-action）
     * 会持续产出 data.type=stream 的分片包，并在 data.type=response 时结束。
     */
    callStream<TPacket = any, TFinal = any>(
        method: string,
        params: any = {},
        options?: { timeout?: number }
    ): { packets: AsyncIterable<TPacket>; result: Promise<TFinal> } {
        const timeout = options?.timeout ?? this.config.api.timeout;
        const queue = new AsyncQueue<TPacket>();

        const result = this.sendRequest<TFinal>(method, params, timeout, {
            onPacket: (packet) => queue.push(packet as TPacket),
            onEnd: () => queue.close(),
            onError: (error) => queue.fail(error),
        });

        return { packets: queue, result };
    }

    /**
     * 处理API响应
     * 由连接管理器调用
     */
    handleResponse(echo: string, response: any): void {
        const request = this.registry.get(echo);
        if (!request) {
            // 流式响应可能会产生多条分片包；如果请求已结束，这里不应刷屏
            if (response?.stream === 'stream-action') {
                this.logger.debug(`收到未知流式响应: ${echo}`);
            } else {
                this.logger.warn(`收到未知请求的响应: ${echo}`);
            }
            return;
        }

        const isStreamAction =
            response?.stream === 'stream-action' ||
            (typeof response?.data?.type === 'string' &&
                ['stream', 'response', 'reset', 'error'].includes(response.data.type));

        // 检查响应状态
        if (response.status === 'ok' || response.retcode === 0) {
            if (isStreamAction) {
                const packet = response.data;
                const packetType = packet?.type;

                // callStream() 模式：同一次请求会收到多包（file_info / file_chunk / file_complete）
                if (request.onPacket) {
                    // 任意分片包都会刷新超时，避免大文件下载被超时打断
                    this.registry.refresh(echo);

                    request.onPacket(packet);
                    if (packetType === 'response') {
                        this.logger.debug(`API流式完成: ${request.method}`);
                        this.registry.resolve(echo, packet);
                        request.onEnd?.();
                    }
                    return;
                }

                // 普通 call()：兼容 stream-action 但只有单包响应（如 upload_file_stream 的 chunk_received）
                this.logger.debug(`API成功(stream): ${request.method}`);
                this.registry.resolve(echo, packet);
                return;
            }

            this.logger.debug(`API成功: ${request.method}`);
            this.registry.resolve(echo, response.data);
        } else {
            this.logger.warn(`API失败: ${request.method}`, {
                retcode: response.retcode,
                message: response.message,
            });
            const error = new ApiError(
                request.method,
                response.retcode,
                response.message,
                response.wording
            );
            request.onError?.(error);
            this.registry.reject(echo, error);
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
        timeout: number,
        hooks?: {
            onPacket?: (packet: any) => void;
            onEnd?: () => void;
            onError?: (error: Error) => void;
        }
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const echo = this.generateRequestId();

            this.logger.debug(`发送API请求: ${method}`, { echo, params });

            // 设置超时定时器
            this.registry.add(
                echo,
                {
                    resolve: (data) => resolve(data),
                    reject: (error) => reject(error),
                    createdAt: Date.now(),
                    method,
                    timeoutMs: timeout,
                    ...(hooks ?? {}),
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
                hooks?.onError?.(error as Error);
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
