import type { NapLinkConfig, Logger } from '../../types/config';
import { MaxReconnectAttemptsError } from '../../types/errors';
import type { ReconnectService } from '../reconnect';
import { ConnectionState } from './state';

export type RetryDeps = {
    config: NapLinkConfig;
    logger: Logger;
    reconnectService: ReconnectService;
    setState: (state: ConnectionState) => void;
    connect: () => Promise<void>;
    onMaxAttemptsReached?: () => void; // 新增：达到最大重连次数时的回调
};

export function handleReconnect(deps: RetryDeps): boolean {
    const { config, logger, reconnectService, setState, connect, onMaxAttemptsReached } = deps;

    if (!reconnectService.hasRemainingAttempts()) {
        setState(ConnectionState.DISCONNECTED);
        const err = new MaxReconnectAttemptsError(reconnectService.getMaxAttempts());
        logger.error('自动重连已达上限，停止重连', err);

        // 触发达到最大重连次数的回调
        if (onMaxAttemptsReached) {
            onMaxAttemptsReached();
        }

        return false;
    }

    setState(ConnectionState.RECONNECTING);
    const scheduled = reconnectService.schedule(() => connect());
    if (!scheduled) {
        setState(ConnectionState.DISCONNECTED);
        const err = new MaxReconnectAttemptsError(config.reconnect.maxAttempts);
        logger.error('自动重连已达上限，停止重连', err);

        // 触发达到最大重连次数的回调
        if (onMaxAttemptsReached) {
            onMaxAttemptsReached();
        }

        return false;
    }

    return true;
}
