import { describe, expect, it, vi } from 'vitest';
import { buildWebSocketUrl } from '../src/core/connection/url';
import { MessageDispatcher } from '../src/core/dispatcher';

function createLogger() {
    return {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    };
}

describe('buildWebSocketUrl', () => {
    it('encodes access_token query value', () => {
        const url = buildWebSocketUrl({
            connection: {
                url: 'ws://napcat:3001',
                token: 'ab+cd&x#y%z',
            },
        } as any);

        expect(url).toContain('access_token=ab%2Bcd%26x%23y%25z');
    });

    it('overwrites existing access_token in URL query', () => {
        const url = buildWebSocketUrl({
            connection: {
                url: 'ws://napcat:3001?foo=1&access_token=old-token',
                token: '123456',
            },
        } as any);

        const parsed = new URL(url);
        expect(parsed.searchParams.getAll('access_token')).toEqual(['123456']);
        expect(parsed.searchParams.get('foo')).toBe('1');
    });
});

describe('MessageDispatcher', () => {
    it('treats response-like packet without post_type as API response', () => {
        const apiClient = {
            handleResponse: vi.fn(),
        } as any;
        const eventRouter = {
            route: vi.fn(),
        } as any;
        const logger = createLogger();

        const dispatcher = new MessageDispatcher(apiClient, eventRouter, logger as any);

        dispatcher.dispatch(JSON.stringify({
            status: 'failed',
            retcode: 1403,
            message: 'token验证失败',
            echo: null,
            data: null,
        }));

        expect(apiClient.handleResponse).toHaveBeenCalledTimes(1);
        expect(eventRouter.route).not.toHaveBeenCalled();
    });
});
