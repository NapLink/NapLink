import type { ApiClient } from '../../core/api-client';

export type AccountApi = {
    getLoginInfo(): Promise<any>;
    getStatus(): Promise<any>;
    getFriendList(): Promise<any>;
    getGroupList(): Promise<any>;
    getGroupInfo(groupId: number | string, noCache?: boolean): Promise<any>;
    getGroupMemberList(groupId: number | string): Promise<any>;
    getGroupMemberInfo(groupId: number | string, userId: number | string, noCache?: boolean): Promise<any>;
    getStrangerInfo(userId: number | string, noCache?: boolean): Promise<any>;
    getVersionInfo(): Promise<any>;
};

export function createAccountApi(client: ApiClient): AccountApi {
    return {
        getLoginInfo() {
            return client.call('get_login_info');
        },
        getStatus() {
            return client.call('get_status');
        },
        getFriendList() {
            return client.call('get_friend_list');
        },
        getGroupList() {
            return client.call('get_group_list');
        },
        getGroupInfo(groupId, noCache = false) {
            return client.call('get_group_info', { group_id: groupId, no_cache: noCache });
        },
        getGroupMemberList(groupId) {
            return client.call('get_group_member_list', { group_id: groupId });
        },
        getGroupMemberInfo(groupId, userId, noCache = false) {
            return client.call('get_group_member_info', {
                group_id: groupId,
                user_id: userId,
                no_cache: noCache,
            });
        },
        getStrangerInfo(userId, noCache = false) {
            return client.call('get_stranger_info', { user_id: userId, no_cache: noCache });
        },
        getVersionInfo() {
            return client.call('get_version_info');
        },
    };
}
