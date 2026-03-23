import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConnectionManager } from '../src/core/connection';
import { NapLink } from '../src/index';

function createLogger() {
    return {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    };
}

describe('NapLink lifecycle', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('disconnect should keep api client reusable', () => {
        const client = new NapLink({
            connection: {
                url: 'ws://localhost:3000',
                pingInterval: 0,
            },
            logging: {
                level: 'off',
            },
        });

        const apiClient = (client as any).apiClient;
        const clearPendingRequestsSpy = vi.spyOn(apiClient, 'clearPendingRequests');
        const destroySpy = vi.spyOn(apiClient, 'destroy');

        client.disconnect();

        expect(clearPendingRequestsSpy).toHaveBeenCalledWith('连接已断开');
        expect(destroySpy).not.toHaveBeenCalled();
    });

    it('dispose should destroy api client', () => {
        const client = new NapLink({
            connection: {
                url: 'ws://localhost:3000',
                pingInterval: 0,
            },
            logging: {
                level: 'off',
            },
        });

        const apiClient = (client as any).apiClient;
        const destroySpy = vi.spyOn(apiClient, 'destroy');

        client.dispose();

        expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    it('connection manager should clear outstanding connect timeout on disconnect', () => {
        vi.useFakeTimers();

        const timeoutSpy = vi.fn();
        const manager = new ConnectionManager(
            {
                connection: { url: 'ws://localhost:3000', pingInterval: 0, timeout: 1000 },
                reconnect: { enabled: false, maxAttempts: 0, backoff: { initial: 1, max: 1, multiplier: 1 } },
                logging: { level: 'off' },
                api: { timeout: 1000, retries: 0 },
            } as any,
            createLogger() as any,
            vi.fn(),
            vi.fn(),
        );

        (manager as any).connectTimeout = setTimeout(timeoutSpy, 1000);

        manager.disconnect();
        vi.advanceTimersByTime(1000);

        expect(timeoutSpy).not.toHaveBeenCalled();
        expect((manager as any).connectTimeout).toBeUndefined();
    });
});
