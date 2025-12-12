import type { HeartbeatService } from '../heartbeat';
import type { NapLinkConfig, Logger } from '../../types/config';

export type HeartbeatDeps = {
    config: NapLinkConfig;
    logger: Logger;
    heartbeatService?: HeartbeatService;
    send: (payload: string) => void;
    onTimeout: () => void;
    createService: (interval: number, onPing: () => void, onTimeout: () => void, logger: Logger) => HeartbeatService;
};

export function startHeartbeat(deps: HeartbeatDeps): HeartbeatService | undefined {
    const { config, logger, send, onTimeout, createService } = deps;
    const interval = config.connection.pingInterval || 0;
    const heartbeatAction = config.connection.heartbeatAction;

    if (interval <= 0 || !heartbeatAction?.action) {
        return undefined;
    }

    const service = createService(
        interval,
        () => {
            try {
                const payload = {
                    action: heartbeatAction.action,
                    params: heartbeatAction.params ?? {},
                    echo: `heartbeat_${Date.now()}`,
                };
                send(JSON.stringify(payload));
            } catch (error) {
                logger.error('发送心跳失败', error as Error);
            }
        },
        onTimeout,
        logger
    );
    service.start();
    return service;
}
