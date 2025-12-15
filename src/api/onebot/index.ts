import type { ApiClient } from '../../core/api-client';
import { createMessageApi, type MessageApi } from './message';
import { createMediaApi, type MediaApi } from './media';
import { createAccountApi, type AccountApi } from './account';
import { createGroupApi, type GroupApi } from './group';
import { createFileApi, type FileApi } from './files';
import { createStreamApi, type StreamApi } from './stream';
import { createRequestApi, type RequestApi } from './requests';
import { createSystemApi, type SystemApi } from './system';
import { createNapCatApi, type NapCatApi } from './napcat';

import type { Logger } from '../../types/config';

/**
 * OneBot 11 API 封装
 * 将 ApiClient 的底层 call 转为清晰的业务方法
 * 通过组合各领域 API，保持类方法名称不变。
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class OneBotApi {
    private messageApi: MessageApi;
    private mediaApi: MediaApi;
    private accountApi: AccountApi;
    private groupApi: GroupApi;
    private fileApi: FileApi;
    private streamApi: StreamApi;
    private requestApi: RequestApi;
    private systemApi: SystemApi;
    private napcatApi: NapCatApi;

    constructor(client: ApiClient, logger: Logger) {
        this.messageApi = createMessageApi(client);
        this.mediaApi = createMediaApi(client, logger);
        this.accountApi = createAccountApi(client);
        this.groupApi = createGroupApi(client);
        this.fileApi = createFileApi(client);
        this.streamApi = createStreamApi(client);
        this.requestApi = createRequestApi(client);
        this.systemApi = createSystemApi(client);
        this.napcatApi = createNapCatApi(client);

        Object.assign(
            this,
            this.messageApi,
            this.mediaApi,
            this.accountApi,
            this.groupApi,
            this.fileApi,
            this.streamApi,
            this.requestApi,
            this.systemApi,
            this.napcatApi,
        );
    }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface OneBotApi extends MessageApi, MediaApi, AccountApi, GroupApi, FileApi, StreamApi, RequestApi, SystemApi, NapCatApi { }
