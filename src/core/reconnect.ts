import type { NapLinkConfig } from '../types/config';
import type { Logger } from '../types/config';

/**
 * 重连服务
 * 实现指数退避算法，避免重连风暴
 */
export class ReconnectService {
    private currentAttempt = 0;
    private backoffMs: number;
    private reconnectTimer?: NodeJS.Timeout | number;

    constructor(
        private config: NapLinkConfig['reconnect'],
        private logger: Logger
    ) {
        this.backoffMs = config.backoff.initial;
    }

    hasRemainingAttempts(): boolean {
        return this.currentAttempt < this.config.maxAttempts;
    }

    getMaxAttempts(): number {
        return this.config.maxAttempts;
    }

    /**
     * 调度重连
     * @param reconnectFn 重连函数
     * @returns 是否调度成功
     */
    schedule(reconnectFn: () => Promise<void>): boolean {
        if (!this.config.enabled) {
            this.logger.warn('自动重连未启用');
            return false;
        }

        if (this.currentAttempt >= this.config.maxAttempts) {
            this.logger.error(
                `达到最大重连次数 (${this.config.maxAttempts})`,
                undefined,
                { attempts: this.currentAttempt }
            );
            return false;
        }

        this.currentAttempt++;

        this.logger.info(
            `将在 ${this.backoffMs}ms 后进行第 ${this.currentAttempt} 次重连...`
        );

        this.reconnectTimer = setTimeout(async () => {
            try {
                await reconnectFn();
                this.reset(); // 重连成功，重置状态
            } catch (error) {
                const err = error as Error;
                this.logger.error(`重连失败: ${err.message}`);
                this.logger.debug('详细错误信息', err);
                // 增加退避延迟
                this.backoffMs = Math.min(
                    this.backoffMs * this.config.backoff.multiplier,
                    this.config.backoff.max
                );
                // 继续尝试重连
                this.schedule(reconnectFn);
            }
        }, this.backoffMs);

        return true;
    }

    /**
     * 重置重连状态
     * 在连接成功后调用
     */
    reset(): void {
        this.currentAttempt = 0;
        this.backoffMs = this.config.backoff.initial;
        this.cancel();
    }

    /**
     * 取消待定的重连
     */
    cancel(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer as NodeJS.Timeout);
            this.reconnectTimer = undefined;
        }
    }

    /**
     * 获取当前重连尝试次数
     */
    getCurrentAttempt(): number {
        return this.currentAttempt;
    }
}
