import type { ApiClient } from '../../core/api-client';

export type RequestApi = {
    handleFriendRequest(flag: string, approve?: boolean, remark?: string): Promise<any>;
    handleGroupRequest(flag: string, subType: 'add' | 'invite', approve?: boolean, reason?: string): Promise<any>;
};

export function createRequestApi(client: ApiClient): RequestApi {
    return {
        handleFriendRequest(flag, approve = true, remark?: string) {
            return client.call('set_friend_add_request', { flag, approve, remark });
        },
        handleGroupRequest(flag, subType, approve = true, reason?: string) {
            return client.call('set_group_add_request', { flag, sub_type: subType, approve, reason });
        },
    };
}
