import { describe, it, expect, vi } from 'vitest';
import { ApiClient } from '../src/core/api-client';

function createLogger() {
    return {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    };
}

describe('ApiClient stream-action handling', () => {
    it('callStream should yield packets until response and resolve result', async () => {
        const logger = createLogger();
        const sent: string[] = [];
        const connection: any = {
            isConnected: () => true,
            send: (payload: string) => sent.push(payload),
        };
        const apiClient = new ApiClient(
            connection,
            {
                connection: { url: 'ws://x', pingInterval: 0 },
                reconnect: { enabled: false, maxAttempts: 0, backoff: { initial: 1, max: 1, multiplier: 1 } },
                logging: { level: 'off', logger },
                api: { timeout: 5000, retries: 0 },
            } as any,
            logger as any
        );

        const { packets, result } = apiClient.callStream('download_file_stream', { file: 'fid', chunk_size: 2 });
        expect(sent.length).toBe(1);
        const echo = JSON.parse(sent[0]).echo as string;

        apiClient.handleResponse(echo, {
            status: 'ok',
            retcode: 0,
            data: { type: 'stream', data_type: 'file_info', file_name: 'a.bin', chunk_size: 2 },
            echo,
            stream: 'stream-action',
        });

        apiClient.handleResponse(echo, {
            status: 'ok',
            retcode: 0,
            data: { type: 'stream', data_type: 'file_chunk', index: 0, data: Buffer.from('hi').toString('base64') },
            echo,
            stream: 'stream-action',
        });

        apiClient.handleResponse(echo, {
            status: 'ok',
            retcode: 0,
            data: { type: 'response', data_type: 'file_complete', total_chunks: 1, total_bytes: 2 },
            echo,
            stream: 'stream-action',
        });

        const received: any[] = [];
        for await (const pkt of packets) {
            received.push(pkt);
        }

        expect(received.map((p) => p.data_type)).toEqual(['file_info', 'file_chunk', 'file_complete']);
        await expect(result).resolves.toMatchObject({ type: 'response', data_type: 'file_complete' });
    });

    it('call should resolve immediately for single stream-action responses', async () => {
        const logger = createLogger();
        const sent: string[] = [];
        const connection: any = {
            isConnected: () => true,
            send: (payload: string) => sent.push(payload),
        };
        const apiClient = new ApiClient(
            connection,
            {
                connection: { url: 'ws://x', pingInterval: 0 },
                reconnect: { enabled: false, maxAttempts: 0, backoff: { initial: 1, max: 1, multiplier: 1 } },
                logging: { level: 'off', logger },
                api: { timeout: 5000, retries: 0 },
            } as any,
            logger as any
        );

        const pending = apiClient.call('upload_file_stream', { stream_id: 'sid', verify_only: true }, { timeout: 5000, retries: 0 });
        const echo = JSON.parse(sent[0]).echo as string;

        apiClient.handleResponse(echo, {
            status: 'ok',
            retcode: 0,
            data: { type: 'stream', stream_id: 'sid', status: 'file_created', received_chunks: 0, total_chunks: 3 },
            echo,
            stream: 'stream-action',
        });

        await expect(pending).resolves.toMatchObject({ type: 'stream', stream_id: 'sid', status: 'file_created' });
    });
});

