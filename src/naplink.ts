import EventEmitter from 'events';
import type { NapLinkConfig, PartialNapLinkConfig, Logger } from './types/config';
import { DefaultLogger } from './utils/logger';
import { ConnectionManager, ConnectionState } from './core/connection';
import { ApiClient } from './core/api-client';
import { EventRouter } from './core/event-router';
import { MessageDispatcher } from './core/dispatcher';
import { handleConnectionStateChange } from './core/connection/state-handler';
import { OneBotApi } from './api';
import { bindOneBotApiMethods, type OneBotApiMethods } from './api/delegates';
import { mergeConfig } from './utils/merge-config';

/**
 * NapLink客户端
 * 现代化的NapCat WebSocket客户端SDK
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class NapLink extends EventEmitter {
    private config: NapLinkConfig;
    private logger: Logger;
    private connection: ConnectionManager;
    private apiClient: ApiClient;
    private eventRouter: EventRouter;
    private dispatcher: MessageDispatcher;
    private oneBotApi: OneBotApi;

    constructor(config: PartialNapLinkConfig) {
        super();

        // 合并配置
        this.config = mergeConfig(config);

        // 初始化logger
        this.logger =
            this.config.logging.logger ||
            new DefaultLogger(this.config.logging.level);

        // 初始化事件路由器
        this.eventRouter = new EventRouter(this.logger);
        this.setupEventForwarding();

        // 初始化API客户端 (需要提前初始化以便传给 Dispatcher)
        // 使用箭头函数作为代理，解决 ConnectionManager 和 Dispatcher 之间的循环依赖
        this.connection = new ConnectionManager(
            this.config,
            this.logger,
            (message) => this.dispatcher.dispatch(message),
            (state, wasReconnecting) => handleConnectionStateChange(this, state, wasReconnecting || false),
            this // 传递 emitter 用于发送 connection:lost 事件
        );

        this.apiClient = new ApiClient(this.connection, this.config, this.logger);
        this.dispatcher = new MessageDispatcher(this.apiClient, this.eventRouter, this.logger);

        this.oneBotApi = new OneBotApi(this.apiClient, this.logger);
        bindOneBotApiMethods(this.oneBotApi, this);

        this.logger.info('NapLink 客户端已初始化');
    }

    /**
     * 连接到NapCat服务器
     */
    async connect(): Promise<void> {
        this.logger.info('开始连接...');
        await this.connection.connect();
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        this.logger.info('断开连接...');
        this.connection.disconnect();
        this.apiClient.destroy();
    }

    /**
     * 获取连接状态
     */
    getState(): ConnectionState {
        return this.connection.getState();
    }

    /**
     * 检查是否已连接
     */
    isConnected(): boolean {
        return this.connection.isConnected();
    }

    /**
     * 补充消息中的媒体直链
     * 自动通过 get_file / get_image / get_record 获取真实下载链接
     */
    async hydrateMessage(message: any[]): Promise<void> {
        return this.api.hydrateMedia(message);
    }

    /**
     * 调用自定义API
     */
    async callApi<T = any>(method: string, params: any = {}): Promise<T> {
        return this.apiClient.call<T>(method, params);
    }

    /**
     * 暴露 OneBot API 便于直接使用
     */
    get api(): OneBotApi {
        return this.oneBotApi;
    }

    // ============ 内部方法 ============

    /**
     * 设置事件转发
     */
    private setupEventForwarding(): void {
        // 转发所有事件路由器的事件
        this.eventRouter.onAny((event, data) => {
            this.emit(event, data);
        });
    }

}

// 通过接口合并将动态绑定的方法暴露到实例类型
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/no-empty-object-type
export interface NapLink extends OneBotApiMethods { }
