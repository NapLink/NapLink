import type { NapLinkConfig, Logger } from '../../types/config';
import { ConnectionState } from './state';
import { handleReconnect } from './retry-handler';
import type { ReconnectService } from '../reconnect';

export type CloseHandlerDeps = {
    getState: () => ConnectionState;
    setState: (state: ConnectionState) => void;
    stopHeartbeat: () => void;
    logger: Logger;
    config: NapLinkConfig;
    reconnect: () => Promise<void>;
    reconnectService: ReconnectService;
};

export function handleCloseEvent(deps: CloseHandlerDeps, event: any): void {
    const { getState, setState, stopHeartbeat, logger, config, reconnectService, reconnect } = deps;

    stopHeartbeat();
    logger.info(`连接关闭 (code: ${event.code}, reason: ${event.reason})`);

    // 1000 是正常关闭，不触发重连
    if (event.code === 1000) {
        setState(ConnectionState.DISCONNECTED);
        return;
    }

    const state = getState();
    if (
        state === ConnectionState.CONNECTED ||
        state === ConnectionState.RECONNECTING ||
        state === ConnectionState.CONNECTING
    ) {
        handleReconnect({
            config,
            logger,
            reconnectService,
            setState,
            connect: reconnect,
        });
    } else {
        setState(ConnectionState.DISCONNECTED);
    }
}
