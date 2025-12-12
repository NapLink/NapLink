import type { Logger } from '../types/config';

/**
 * 心跳服务
 * 定期发送ping消息保持连接活跃
 */
export class HeartbeatService {
    private timer?: NodeJS.Timeout | number;
    private lastPongTime = 0;
    private missedPings = 0;
    private static readonly MAX_MISSED_PINGS = 3;

    constructor(
        private interval: number,
        private sendPing: () => void,
        private onTimeout: () => void,
        private logger: Logger
    ) { }

    /**
     * 启动心跳
     */
    start(): void {
        if (this.interval <= 0) {
            this.logger.debug('心跳已禁用 (interval: 0)');
            return;
        }

        this.logger.debug(`启动心跳服务 (间隔: ${this.interval}ms)`);
        this.lastPongTime = Date.now();
        this.missedPings = 0;

        this.timer = setInterval(() => {
            const now = Date.now();
            const elapsed = now - this.lastPongTime;

            // 检查是否超时
            if (elapsed > this.interval * HeartbeatService.MAX_MISSED_PINGS) {
                this.missedPings++;
                this.logger.warn(
                    `心跳超时 (${this.missedPings}/${HeartbeatService.MAX_MISSED_PINGS})`,
                    { elapsed }
                );

                if (this.missedPings >= HeartbeatService.MAX_MISSED_PINGS) {
                    this.logger.error('心跳连续超时，触发重连');
                    this.stop();
                    this.onTimeout();
                    return;
                }
            }

            // 发送ping
            this.logger.debug('发送心跳 ping');
            this.sendPing();
        }, this.interval);
    }

    /**
     * 停止心跳
     */
    stop(): void {
        if (this.timer) {
            clearInterval(this.timer as NodeJS.Timeout);
            this.timer = undefined;
            this.logger.debug('心跳服务已停止');
        }
    }

    /**
     * 记录收到pong
     */
    recordPong(): void {
        this.lastPongTime = Date.now();
        this.missedPings = 0;
        this.logger.debug('收到心跳 pong');
    }

    /**
     * 检查心跳是否活跃
     */
    isActive(): boolean {
        return this.timer !== undefined;
    }
}
