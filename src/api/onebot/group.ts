import type { ApiClient } from '../../core/api-client';

export type GroupApi = {
    setGroupBan(groupId: number | string, userId: number | string, duration?: number): Promise<any>;
    unsetGroupBan(groupId: number | string, userId: number | string): Promise<any>;
    setGroupWholeBan(groupId: number | string, enable?: boolean): Promise<any>;
    setGroupKick(groupId: number | string, userId: number | string, rejectAddRequest?: boolean): Promise<any>;
    setGroupLeave(groupId: number | string, isDismiss?: boolean): Promise<any>;
    setGroupCard(groupId: number | string, userId: number | string, card: string): Promise<any>;
    setGroupName(groupId: number | string, groupName: string): Promise<any>;
    setGroupAdmin(groupId: number | string, userId: number | string, enable?: boolean): Promise<any>;
    setGroupAnonymousBan(groupId: number | string, anonymousFlag: string, duration?: number): Promise<any>;
    setGroupSpecialTitle(
        groupId: number | string,
        userId: number | string,
        specialTitle: string,
        duration?: number
    ): Promise<any>;
    sendLike(userId: number | string, times?: number): Promise<any>;
};

export function createGroupApi(client: ApiClient): GroupApi {
    return {
        setGroupBan(groupId, userId, duration = 30 * 60) {
            return client.call('set_group_ban', { group_id: groupId, user_id: userId, duration });
        },
        unsetGroupBan(groupId, userId) {
            return client.call('set_group_ban', { group_id: groupId, user_id: userId, duration: 0 });
        },
        setGroupWholeBan(groupId, enable = true) {
            return client.call('set_group_whole_ban', { group_id: groupId, enable });
        },
        setGroupKick(groupId, userId, rejectAddRequest = false) {
            return client.call('set_group_kick', {
                group_id: groupId,
                user_id: userId,
                reject_add_request: rejectAddRequest,
            });
        },
        setGroupLeave(groupId, isDismiss = false) {
            return client.call('set_group_leave', { group_id: groupId, is_dismiss: isDismiss });
        },
        setGroupCard(groupId, userId, card) {
            return client.call('set_group_card', { group_id: groupId, user_id: userId, card });
        },
        setGroupName(groupId, groupName) {
            return client.call('set_group_name', { group_id: groupId, group_name: groupName });
        },
        setGroupAdmin(groupId, userId, enable = true) {
            return client.call('set_group_admin', { group_id: groupId, user_id: userId, enable });
        },
        setGroupAnonymousBan(groupId, anonymousFlag, duration = 30 * 60) {
            return client.call('set_group_anonymous_ban', {
                group_id: groupId,
                anonymous_flag: anonymousFlag,
                duration,
            });
        },
        setGroupSpecialTitle(groupId, userId, specialTitle, duration = -1) {
            return client.call('set_group_special_title', {
                group_id: groupId,
                user_id: userId,
                special_title: specialTitle,
                duration,
            });
        },
        sendLike(userId, times = 1) {
            return client.call('send_like', { user_id: userId, times });
        },
    };
}
