import EventEmitter from 'events';
import type { Logger } from '../types/config';

/**
 * 事件路由器
 * 负责解析OneBot事件并分发到相应的事件处理器
 */
export class EventRouter extends EventEmitter {
    private anyListeners: ((event: string | symbol, ...args: any[]) => void)[] = [];

    constructor(private logger: Logger) {
        super();
    }

    /**
     * 监听所有事件
     */
    onAny(listener: (event: string | symbol, ...args: any[]) => void): this {
        this.anyListeners.push(listener);
        return this;
    }

    /**
     * 重写emit以支持onAny
     */
    override emit(event: string | symbol, ...args: any[]): boolean {
        // 先调用anyListeners
        this.anyListeners.forEach((listener) => {
            try {
                listener(event, ...args);
            } catch (error) {
                this.logger.error('onAny listener error', error as Error);
            }
        });

        return super.emit(event, ...args);
    }

    /**
     * 路由消息到相应的事件
     * @param data 原始消息数据
     */
    route(data: any): void {
        try {
            const postType = data.post_type;

            if (!postType) {
                this.logger.warn('收到无效消息: 缺少 post_type', data);
                return;
            }

            this.logger.debug(`路由事件: ${postType}`, {
                messageType: data.message_type,
                noticeType: data.notice_type,
            });

            // 根据 post_type 分发
            switch (postType) {
                case 'meta_event':
                    this.routeMetaEvent(data);
                    break;
                case 'message':
                    this.routeMessage(data);
                    break;
                case 'message_sent':
                    this.routeMessageSent(data);
                    break;
                case 'notice':
                    this.routeNotice(data);
                    break;
                case 'request':
                    this.routeRequest(data);
                    break;
                default:
                    this.logger.warn(`未知的 post_type: ${postType}`);
                    this.emit('unknown', data);
            }

            // 同时触发原始事件
            this.emit('raw', data);
        } catch (error) {
            this.logger.error('事件路由失败', error as Error, data);
        }
    }

    /**
     * 路由元事件
     */
    private routeMetaEvent(data: any): void {
        const type = data.meta_event_type;
        const events = [`meta_event`, `meta_event.${type}`];

        if (type === 'lifecycle') {
            events.push(`meta_event.lifecycle.${data.sub_type}`);
        }

        this.emitEvents(events, data);
    }

    /**
     * 路由消息事件
     */
    private routeMessage(data: any): void {
        const messageType = data.message_type;
        const subType = data.sub_type;

        const events = [
            'message',
            `message.${messageType}`,
            `message.${messageType}.${subType}`,
        ];

        this.emitEvents(events, data);
    }

    /**
     * 路由发送消息事件
     */
    private routeMessageSent(data: any): void {
        const messageType = data.message_type;
        const subType = data.sub_type;

        const events = [
            'message_sent',
            `message_sent.${messageType}`,
            `message_sent.${messageType}.${subType}`,
        ];

        this.emitEvents(events, data);
    }

    /**
     * 路由通知事件
     */
    private routeNotice(data: any): void {
        const noticeType = data.notice_type;
        const subType = data.sub_type;

        const events = ['notice', `notice.${noticeType}`];

        if (subType) {
            events.push(`notice.${noticeType}.${subType}`);
        }

        this.emitEvents(events, data);
    }

    /**
     * 路由请求事件
     */
    private routeRequest(data: any): void {
        const requestType = data.request_type;
        const subType = data.sub_type;

        const events = ['request', `request.${requestType}`];

        if (subType) {
            events.push(`request.${requestType}.${subType}`);
        }

        this.emitEvents(events, data);
    }

    /**
     * 触发多个事件
     */
    private emitEvents(events: string[], data: any): void {
        for (const event of events) {
            this.logger.debug(`触发事件: ${event}`);
            this.emit(event, data);
        }
    }
}
