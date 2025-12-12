import { randomUUID } from 'crypto';
import type { ApiClient } from '../../core/api-client';
import { prepareStreamSource, computeSha256, iterateChunks } from '../../core/upload/stream';

export type StreamApi = {
    uploadFileStream(
        file: string | Buffer | Uint8Array | NodeJS.ReadableStream,
        options?: {
            chunkSize?: number;
            streamId?: string;
            expectedSha256?: string;
            fileRetention?: number;
            filename?: string;
            reset?: boolean;
            verifyOnly?: boolean;
        }
    ): Promise<any>;
    getUploadStreamStatus(streamId: string): Promise<any>;
};

export function createStreamApi(client: ApiClient): StreamApi {
    return {
        async uploadFileStream(file, options) {
            const chunkSize = options?.chunkSize ?? 256 * 1024;
            const streamId = options?.streamId ?? randomUUID();

            const { source, size, filename, cleanupTemp } = await prepareStreamSource(file, options?.filename);

            const expectedSha256 = options?.expectedSha256 ?? (await computeSha256(source));
            const totalChunks = Math.ceil(size / chunkSize);

            if (options?.reset) {
                await client.call('upload_file_stream', { stream_id: streamId, reset: true });
            }

            let chunkIndex = 0;
            for await (const chunk of iterateChunks(source, size, chunkSize)) {
                const payload: any = {
                    stream_id: streamId,
                    chunk_data: chunk.toString('base64'),
                    chunk_index: chunkIndex,
                    total_chunks: totalChunks,
                    file_size: size,
                    expected_sha256: expectedSha256,
                    filename,
                };
                if (options?.fileRetention != null) {
                    payload.file_retention = options.fileRetention;
                }
                if (options?.verifyOnly) {
                    payload.verify_only = true;
                }

                await client.call('upload_file_stream', payload);
                chunkIndex++;
            }

            const completion = await client.call('upload_file_stream', {
                stream_id: streamId,
                is_complete: true,
            });

            await cleanupTemp?.();
            return completion;
        },

        getUploadStreamStatus(streamId: string) {
            return client.call('upload_file_stream', { stream_id: streamId });
        },
    };
}
