import { promises as fs, createWriteStream, createReadStream } from 'fs';
import { tmpdir } from 'os';
import { join, basename } from 'path';
import { randomUUID, createHash } from 'crypto';
import { pipeline } from 'stream/promises';

export type StreamSource = {
    source: string | Buffer;
    size: number;
    filename: string;
    cleanupTemp?: () => Promise<void>;
};

export async function prepareStreamSource(
    file: string | Buffer | Uint8Array | NodeJS.ReadableStream,
    overrideName?: string
): Promise<StreamSource> {
    if (typeof file === 'string') {
        const stats = await fs.stat(file);
        return { source: file, size: stats.size, filename: overrideName || basename(file) };
    }

    if (file instanceof Buffer || file instanceof Uint8Array) {
        return { source: Buffer.from(file), size: file.length, filename: overrideName || 'upload.bin' };
    }

    // ReadableStream -> 写入临时文件
    const tempPath = join(tmpdir(), `${randomUUID()}-upload.tmp`);
    await pipeline(file, createWriteStream(tempPath));
    const stats = await fs.stat(tempPath);
    return {
        source: tempPath,
        size: stats.size,
        filename: overrideName || basename(tempPath),
        cleanupTemp: async () => {
            try { await fs.unlink(tempPath); } catch { /* ignore */ }
        }
    };
}

export async function* iterateChunks(source: string | Buffer, size: number, chunkSize: number): AsyncGenerator<Buffer> {
    if (typeof source === 'string') {
        const stream = createReadStream(source, { highWaterMark: chunkSize });
        for await (const chunk of stream) {
            yield chunk as Buffer;
        }
    } else {
        let offset = 0;
        while (offset < size) {
            const end = Math.min(offset + chunkSize, size);
            yield source.slice(offset, end);
            offset = end;
        }
    }
}

export async function computeSha256(source: string | Buffer): Promise<string> {
    const hash = createHash('sha256');

    if (typeof source === 'string') {
        const stream = createReadStream(source);
        for await (const chunk of stream) {
            hash.update(chunk as Buffer);
        }
    } else {
        hash.update(source);
    }

    return hash.digest('hex');
}
