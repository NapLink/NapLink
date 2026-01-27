import WebSocket from 'isomorphic-ws';
import type { NapLinkConfig, Logger } from '../../types/config';
import { ConnectionError } from '../../types/errors';
import { ConnectionState } from './state';

export type HandlerDeps = {
    config: NapLinkConfig;
    logger: Logger;
    setState: (state: ConnectionState) => void;
    resetReconnect: () => void;
    startHeartbeat: () => void;
    recordPong: () => void;
    onMessage: (data: string) => void;
    onClose: (event: any) => void;
    clearConnectTimeout: () => void;
};

export function attachWebSocketHandlers(
    ws: WebSocket,
    deps: HandlerDeps,
    resolve: () => void,
    reject: (err: Error) => void
): NodeJS.Timeout | number {
    const { config, logger } = deps;

    // 设置连接超时
    const timeoutMs = config.connection.timeout || 30000;
    const connectTimeout = setTimeout(() => {
        if (ws && ws.readyState !== WebSocket.OPEN) {
            logger.error(`连接超时 (${timeoutMs}ms)`);
            ws.close();
            reject(new ConnectionError(`连接超时 (${timeoutMs}ms)`));
        }
    }, timeoutMs);

    ws.onopen = () => {
        deps.clearConnectTimeout();
        deps.setState(ConnectionState.CONNECTED);
        deps.resetReconnect();
        deps.startHeartbeat();
        deps.logger.info('WebSocket 连接已建立');
        resolve();
    };

    ws.onerror = (event: any) => {
        deps.clearConnectTimeout();
        const error = new ConnectionError('WebSocket 错误', event);
        deps.logger.error(`连接错误: ${error.message}`);
        deps.logger.debug('详细错误信息', error);
        reject(error);
    };

    ws.onclose = (event) => {
        deps.clearConnectTimeout();
        deps.onClose(event);
    };

    ws.onmessage = (event) => {
        try {
            deps.recordPong();
            deps.onMessage(event.data.toString());
        } catch (error) {
            deps.logger.error('消息处理失败', error as Error);
        }
    };

    return connectTimeout;
}
