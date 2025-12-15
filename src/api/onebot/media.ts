import type { ApiClient } from '../../core/api-client';
import type { Logger } from '../../types/config';

export type MediaApi = {
    getImage(file: string): Promise<any>;
    getRecord(file: string, outFormat?: string): Promise<any>;
    getFile(file: string): Promise<any>;
    hydrateMedia(message: any[]): Promise<void>;
};

export function createMediaApi(client: ApiClient, logger: Logger): MediaApi {
    const api = {
        getImage(file: string) {
            return client.call('get_image', { file });
        },
        getRecord(file: string, outFormat?: string) {
            return client.call('get_record', { file, out_format: outFormat });
        },
        getFile(file: string) {
            return client.call('get_file', { file });
        },
        async hydrateMedia(message: any[]) {
            if (!Array.isArray(message)) return;

            await Promise.all(message.map(async (segment) => {
                const type = segment?.type;
                const data = segment?.data;
                if (!type || !data) return;

                if (['image', 'video', 'record', 'audio', 'file'].includes(type)) {
                    const fileId = data.file ?? data.file_id;
                    // 如果已经是 http 或 file 协议，或者是 base64 (虽然 base64 一般不走这里)，则跳过
                    if (typeof fileId === 'string' && !/^https?:\/\//.test(fileId) && !fileId.startsWith('file://')) {
                        try {
                            // 优先尝试通用 get_file
                            const res = await api.getFile(fileId);
                            const hydratedUrl = res?.file ?? res?.url;
                            if (hydratedUrl) {
                                data.url = hydratedUrl;
                                data.file = hydratedUrl;
                                return;
                            }

                            // 针对特定类型的降级/专用获取
                            if (type === 'record' || type === 'audio') {
                                const rec = await api.getRecord(fileId, 'mp3');
                                const recUrl = rec?.file ?? rec?.url;
                                if (recUrl) {
                                    data.url = recUrl;
                                    data.file = recUrl;
                                }
                            } else if (type === 'image') {
                                const img = await api.getImage(fileId);
                                const imgUrl = img?.file ?? img?.url;
                                if (imgUrl) {
                                    data.url = imgUrl;
                                    data.file = imgUrl;
                                }
                            }
                        } catch (e) {
                            logger.debug(`Failed to hydrate media for ${type}: ${fileId}`, e);
                        }
                    }
                }
            }));
        }
    };
    return api;
}
