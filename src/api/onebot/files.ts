import { promises as fs, createWriteStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { pipeline } from 'stream/promises';
import type { ApiClient } from '../../core/api-client';

export type FileApi = {
    uploadGroupFile(groupId: number | string, file: string | Buffer | Uint8Array | NodeJS.ReadableStream, name: string): Promise<any>;
    uploadPrivateFile(userId: number | string, file: string | Buffer | Uint8Array | NodeJS.ReadableStream, name: string): Promise<any>;
    setGroupPortrait(groupId: number | string, file: string | Buffer | Uint8Array | NodeJS.ReadableStream): Promise<any>;

    getGroupFileSystemInfo(groupId: number | string): Promise<any>;
    getGroupRootFiles(groupId: number | string): Promise<any>;
    getGroupFilesByFolder(groupId: number | string, folderId: string): Promise<any>;
    getGroupFileUrl(groupId: number | string, fileId: string, busid?: number): Promise<any>;
    deleteGroupFile(groupId: number | string, fileId: string, busid?: number): Promise<any>;
    createGroupFileFolder(groupId: number | string, name: string, parentId?: string): Promise<any>;
    deleteGroupFolder(groupId: number | string, folderId: string): Promise<any>;

    downloadFile(url: string, threadCount?: number, headers?: Record<string, string>): Promise<any>;
};

export function createFileApi(client: ApiClient): FileApi {
    const normalizeFileInput = async (file: string | Buffer | Uint8Array | NodeJS.ReadableStream, name: string) => {
        if (typeof file === 'string') return file;

        const tempPath = join(tmpdir(), `${randomUUID()}-${name || 'naplink.tmp'}`);

        if (file instanceof Buffer || file instanceof Uint8Array) {
            await fs.writeFile(tempPath, file);
            return tempPath;
        }

        await pipeline(file, createWriteStream(tempPath));
        return tempPath;
    };

    return {
        async uploadGroupFile(groupId, file, name) {
            const normalized = await normalizeFileInput(file, name);
            return client.call('upload_group_file', { group_id: groupId, file: normalized, name });
        },
        async uploadPrivateFile(userId, file, name) {
            const normalized = await normalizeFileInput(file, name);
            return client.call('upload_private_file', { user_id: userId, file: normalized, name });
        },
        async setGroupPortrait(groupId, file) {
            return this.uploadGroupFile(groupId, file as any, 'portrait');
        },
        getGroupFileSystemInfo(groupId) {
            return client.call('get_group_file_system_info', { group_id: groupId });
        },
        getGroupRootFiles(groupId) {
            return client.call('get_group_root_files', { group_id: groupId });
        },
        getGroupFilesByFolder(groupId, folderId) {
            return client.call('get_group_files_by_folder', { group_id: groupId, folder_id: folderId });
        },
        getGroupFileUrl(groupId, fileId, busid) {
            return client.call('get_group_file_url', { group_id: groupId, file_id: fileId, busid });
        },
        deleteGroupFile(groupId, fileId, busid) {
            return client.call('delete_group_file', { group_id: groupId, file_id: fileId, busid });
        },
        createGroupFileFolder(groupId, name, parentId) {
            return client.call('create_group_file_folder', { group_id: groupId, name, parent_id: parentId });
        },
        deleteGroupFolder(groupId, folderId) {
            return client.call('delete_group_folder', { group_id: groupId, folder_id: folderId });
        },
        downloadFile(url, threadCount = 3, headers?: Record<string, string>) {
            return client.call('download_file', { url, thread_count: threadCount, headers });
        },
    };
}
