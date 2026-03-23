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

            // API响应包可能存在 echo=null（如 token 校验失败），不能只依赖 truthy echo。
            const isApiResponse =
                data &&
                typeof data === 'object' &&
                ('echo' in data || 'status' in data || 'retcode' in data);

            if (isApiResponse) {
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
