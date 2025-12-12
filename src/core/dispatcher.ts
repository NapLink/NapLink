import type { Logger } from '../types/config';
import type { ApiClient } from './api-client';
import type { EventRouter } from './event-router';

export class MessageDispatcher {
    constructor(
        private apiClient: ApiClient,
        private eventRouter: EventRouter,
        private logger: Logger
    ) { }

    /**
     * 分发消息
     * @param message WebSocket 接收到的原始字符串消息
     */
    dispatch(message: string): void {
        try {
            const data = JSON.parse(message);

            // 如果有echo，说明是API响应
            if (data.echo) {
                // 忽略心跳响应
                if (typeof data.echo === 'string' && data.echo.startsWith('heartbeat_')) {
                    return;
                }
                this.apiClient.handleResponse(data.echo, data);
            } else {
                // 否则是事件
                this.eventRouter.route(data);
            }
        } catch (error) {
            this.logger.error('消息解析失败', error as Error, { message });
        }
    }
}
