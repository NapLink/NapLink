import WebSocket from 'isomorphic-ws';
import type { NapLinkConfig, Logger } from '../../types/config';
import {
    ConnectionError,
    ConnectionClosedError,
} from '../../types/errors';
import { ReconnectService } from '../reconnect';
import { HeartbeatService } from '../heartbeat';
import { ConnectionState } from './state';
import { buildWebSocketUrl } from './url';
import { startHeartbeat } from './heartbeat-runner';
import { handleCloseEvent } from './close-handler';
import { attachWebSocketHandlers } from './handlers';

/**
 * WebSocket 连接管理器
 * 负责管理连接生命周期、重连、心跳等
 */
export class ConnectionManager {
    private ws?: WebSocket;
    private state: ConnectionState = ConnectionState.DISCONNECTED;
    private reconnectService: ReconnectService;
    private heartbeatService?: HeartbeatService;
    private connectPromise?: Promise<void>;
    private connectTimeout?: NodeJS.Timeout | number;

    constructor(
        private config: NapLinkConfig,
        private logger: Logger,
        private onMessage: (data: string) => void,
        private onStateChange: (state: ConnectionState) => void
    ) {
        this.reconnectService = new ReconnectService(config.reconnect, logger);
    }

    /**
     * 连接到WebSocket服务器
     */
    async connect(): Promise<void> {
        // 如果正在连接，返回现有的Promise
        if (this.connectPromise) {
            return this.connectPromise;
        }

        this.setState(ConnectionState.CONNECTING);

        this.connectPromise = this.performConnect();

        try {
            await this.connectPromise;
        } finally {
            this.connectPromise = undefined;
        }
    }

    /**
     * 执行实际的连接逻辑
     */
    private performConnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            const url = buildWebSocketUrl(this.config);
            this.logger.info(`连接到 ${url}`);

            try {
                this.ws = new WebSocket(url);
            } catch (error) {
                const err = new ConnectionError('WebSocket 创建失败', error);
                this.logger.error('连接失败', err);
                reject(err);
                return;
            }

            const timeoutHandle = attachWebSocketHandlers(
                this.ws,
                {
                    config: this.config,
                    logger: this.logger,
                    setState: (s) => this.setState(s),
                    resetReconnect: () => this.reconnectService.reset(),
                    startHeartbeat: () => {
                        this.heartbeatService = startHeartbeat({
                            config: this.config,
                            logger: this.logger,
                            send: (payload) => this.send(payload),
                            onTimeout: () => this.handleHeartbeatTimeout(),
                            createService: (interval, onPing, onTimeout, logger) =>
                                new HeartbeatService(interval, onPing, onTimeout, logger),
                        });
                    },
                    recordPong: () => this.heartbeatService?.recordPong(),
                    onMessage: (data: string) => this.onMessage(data),
                    onClose: (event: any) => handleCloseEvent({
                        getState: () => this.state,
                        setState: (s) => this.setState(s),
                        stopHeartbeat: () => this.stopHeartbeat(),
                        logger: this.logger,
                        config: this.config,
                        reconnectService: this.reconnectService,
                        reconnect: () => this.connect(),
                    }, event),
                    clearConnectTimeout: () => this.clearConnectTimeout(),
                },
                resolve,
                reject,
            );
            this.connectTimeout = timeoutHandle;
        });
    }

    /**
     * 断开连接
     * @param code 关闭代码
     * @param reason 关闭原因
     */
    disconnect(code = 1000, reason = '正常关闭'): void {
        this.logger.info(`断开连接: ${reason}`);

        this.reconnectService.cancel();
        this.stopHeartbeat();

        if (this.ws) {
            try {
                this.ws.close(code, reason);
            } catch (error) {
                this.logger.error('关闭连接失败', error as Error);
            }
            this.ws = undefined;
        }

        this.setState(ConnectionState.DISCONNECTED);
    }

    /**
     * 发送数据
     */
    send(data: string): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new ConnectionClosedError(
                this.ws?.readyState || -1,
                '连接未建立或已关闭'
            );
        }

        this.ws.send(data);
    }

    /**
     * 获取当前状态
     */
    getState(): ConnectionState {
        return this.state;
    }

    /**
     * 检查是否已连接
     */
    isConnected(): boolean {
        return (
            this.state === ConnectionState.CONNECTED &&
            this.ws?.readyState === WebSocket.OPEN
        );
    }

    /**
     * 设置状态并通知
     */
    private setState(state: ConnectionState): void {
        if (this.state !== state) {
            this.state = state;
            this.logger.debug(`状态变更: ${state}`);
            this.onStateChange(state);
        }
    }

    /**
     * 停止心跳
     */
    private stopHeartbeat(): void {
        if (this.heartbeatService) {
            this.heartbeatService.stop();
            this.heartbeatService = undefined;
        }
    }

    /**
     * 处理心跳超时
     */
    private handleHeartbeatTimeout(): void {
        this.logger.warn('心跳超时，主动断开连接');
        this.disconnect(4000, '心跳超时');
    }

    /**
     * 处理连接关闭并尝试重连
     */
    private clearConnectTimeout(): void {
        if (this.connectTimeout) {
            clearTimeout(this.connectTimeout as NodeJS.Timeout);
            this.connectTimeout = undefined;
        }
    }
}
