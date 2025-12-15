import { randomUUID } from 'crypto';
import type { ApiClient } from '../../core/api-client';
import { prepareStreamSource, computeSha256, iterateChunks } from '../../core/upload/stream';
import { createWriteStream } from 'fs';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

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

    /**
     * 流式下载文件（原始分片包）
     * - data_type=file_info / file_chunk / file_complete
     * - type=stream / response
     */
    downloadFileStream(fileId: string, options?: { chunkSize?: number }): { packets: AsyncIterable<DownloadStreamPacket>; result: Promise<DownloadStreamPacket> };
    downloadFileStreamToFile(fileId: string, options?: { chunkSize?: number; filename?: string }): Promise<{ path: string; info?: DownloadStreamPacket }>;

    downloadFileImageStream(fileId: string, options?: { chunkSize?: number }): { packets: AsyncIterable<DownloadStreamPacket>; result: Promise<DownloadStreamPacket> };
    downloadFileImageStreamToFile(fileId: string, options?: { chunkSize?: number; filename?: string }): Promise<{ path: string; info?: DownloadStreamPacket }>;

    downloadFileRecordStream(fileId: string, outFormat?: string, options?: { chunkSize?: number; filename?: string }): { packets: AsyncIterable<DownloadStreamPacket>; result: Promise<DownloadStreamPacket> };
    downloadFileRecordStreamToFile(fileId: string, outFormat?: string, options?: { chunkSize?: number; filename?: string }): Promise<{ path: string; info?: DownloadStreamPacket }>;

    cleanStreamTempFile(): Promise<any>;
};

export type DownloadStreamPacket = {
    type: 'stream' | 'response' | 'reset' | 'error';
    data_type?: 'file_info' | 'file_chunk' | 'file_complete' | string;
    file_name?: string;
    file_size?: number;
    chunk_size?: number;
    index?: number;
    data?: string;
    size?: number;
    progress?: number;
    base64_size?: number;
    total_chunks?: number;
    total_bytes?: number;
    message?: string;
    width?: number;
    height?: number;
    out_format?: string;
};

export function createStreamApi(client: ApiClient): StreamApi {
    const downloadToFile = async (
        action: string,
        params: Record<string, any>,
        filenameHint?: string,
    ): Promise<{ path: string; info?: DownloadStreamPacket }> => {
        const { packets } = client.callStream<DownloadStreamPacket, DownloadStreamPacket>(action, params);

        let fileInfo: DownloadStreamPacket | undefined;
        const tempPath = join(tmpdir(), `${randomUUID()}-${filenameHint || 'naplink.download'}`);
        const writeStream = createWriteStream(tempPath);

        try {
            for await (const packet of packets) {
                if (packet?.data_type === 'file_info') {
                    fileInfo = packet;
                }
                if (packet?.data_type === 'file_chunk' && typeof packet.data === 'string') {
                    writeStream.write(Buffer.from(packet.data, 'base64'));
                }
            }
            await new Promise<void>((resolve, reject) => {
                writeStream.once('error', reject);
                writeStream.end(() => resolve());
            });
            return { path: tempPath, info: fileInfo };
        } catch (error) {
            try {
                writeStream.destroy();
            } catch {
                // ignore
            }
            await fs.unlink(tempPath).catch(() => undefined);
            throw error;
        }
    };

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
            return client.call('upload_file_stream', { stream_id: streamId, verify_only: true });
        },

        downloadFileStream(fileId, options) {
            const chunkSize = options?.chunkSize ?? 64 * 1024;
            return client.callStream<DownloadStreamPacket, DownloadStreamPacket>('download_file_stream', {
                file: fileId,
                chunk_size: chunkSize,
            });
        },
        async downloadFileStreamToFile(fileId, options) {
            const chunkSize = options?.chunkSize ?? 64 * 1024;
            return downloadToFile('download_file_stream', { file: fileId, chunk_size: chunkSize }, options?.filename);
        },

        downloadFileImageStream(fileId, options) {
            const chunkSize = options?.chunkSize ?? 64 * 1024;
            return client.callStream<DownloadStreamPacket, DownloadStreamPacket>('download_file_image_stream', {
                file: fileId,
                chunk_size: chunkSize,
            });
        },
        async downloadFileImageStreamToFile(fileId, options) {
            const chunkSize = options?.chunkSize ?? 64 * 1024;
            return downloadToFile('download_file_image_stream', { file: fileId, chunk_size: chunkSize }, options?.filename);
        },

        downloadFileRecordStream(fileId, outFormat, options) {
            const chunkSize = options?.chunkSize ?? 64 * 1024;
            return client.callStream<DownloadStreamPacket, DownloadStreamPacket>('download_file_record_stream', {
                file: fileId,
                chunk_size: chunkSize,
                out_format: outFormat,
            });
        },
        async downloadFileRecordStreamToFile(fileId, outFormat, options) {
            const chunkSize = options?.chunkSize ?? 64 * 1024;
            return downloadToFile(
                'download_file_record_stream',
                { file: fileId, chunk_size: chunkSize, out_format: outFormat },
                options?.filename,
            );
        },

        cleanStreamTempFile() {
            return client.call('clean_stream_temp_file');
        },
    };
}
