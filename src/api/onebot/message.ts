import type { ApiClient } from '../../core/api-client';
import type { GroupHonorInfo, GroupSystemMessages } from '../../types/onebot';

export type MessageApi = {
    // 基础消息
    sendMessage(params: {
        message_type?: 'private' | 'group';
        user_id?: number | string;
        group_id?: number | string;
        message: any;
        auto_escape?: boolean;
    }): Promise<any>;
    sendPrivateMessage(userId: number | string, message: any): Promise<any>;
    sendGroupMessage(groupId: number | string, message: any): Promise<any>;
    deleteMessage(messageId: number | string): Promise<any>;
    getMessage(messageId: number | string): Promise<any>;
    getForwardMessage(id: string): Promise<any>;
    sendGroupForwardMessage(groupId: number | string, messages: any[]): Promise<any>;

    // 精华 / 已读 / @全体剩余
    setEssenceMessage(messageId: number | string): Promise<any>;
    deleteEssenceMessage(messageId: number | string): Promise<any>;
    getEssenceMessageList(groupId: number | string): Promise<any>;
    markMessageAsRead(messageId: number | string): Promise<any>;
    markGroupMsgAsRead(groupId: number | string): Promise<any>;
    markPrivateMsgAsRead(userId: number | string): Promise<any>;
    markAllMsgAsRead(): Promise<any>;
    getGroupAtAllRemain(groupId: number | string): Promise<number>;

    // 系统/荣誉消息
    getGroupSystemMsg(): Promise<GroupSystemMessages>;
    getGroupHonorInfo(
        groupId: number | string,
        type: 'all' | 'talkative' | 'performer' | 'legend' | 'strong_newbie' | 'emotion'
    ): Promise<GroupHonorInfo>;

    // 消息历史 / 最近会话（NapCat 扩展）
    getGroupMsgHistory(params: {
        group_id: number | string;
        message_seq: number | string;
        count: number;
        reverse_order?: boolean;
    }): Promise<any>;
    getFriendMsgHistory(params: {
        user_id: number | string;
        message_seq: number | string;
        count: number;
        reverse_order?: boolean;
    }): Promise<any>;
    getRecentContact(count: number): Promise<any>;

    // 表情回应（NapCat 扩展）
    setMsgEmojiLike(messageId: number | string, emojiId: number, set: boolean): Promise<any>;
    fetchEmojiLike(params: {
        message_id: number | string;
        emojiId: string;
        emojiType: string;
        group_id?: number | string;
        user_id?: number | string;
        count?: number;
        cookie?: string;
    }): Promise<any>;

    // 戳一戳（NapCat 扩展）
    sendGroupPoke(groupId: number | string, userId: number | string): Promise<any>;
    sendFriendPoke(userId: number | string): Promise<any>;
    sendPoke(targetId: number | string, groupId?: number | string): Promise<any>;
};

export function createMessageApi(client: ApiClient): MessageApi {
    return {
        sendMessage(params) {
            return client.call('send_msg', params);
        },
        sendPrivateMessage(userId, message) {
            return client.call('send_private_msg', { user_id: userId, message });
        },
        sendGroupMessage(groupId, message) {
            return client.call('send_group_msg', { group_id: groupId, message });
        },
        deleteMessage(messageId) {
            return client.call('delete_msg', { message_id: messageId });
        },
        getMessage(messageId) {
            return client.call('get_msg', { message_id: messageId });
        },
        getForwardMessage(id) {
            return client.call('get_forward_msg', { id });
        },
        sendGroupForwardMessage(groupId, messages) {
            return client.call('send_group_forward_msg', { group_id: groupId, messages });
        },
        setEssenceMessage(messageId) {
            return client.call('set_essence_msg', { message_id: messageId });
        },
        deleteEssenceMessage(messageId) {
            return client.call('delete_essence_msg', { message_id: messageId });
        },
        getEssenceMessageList(groupId) {
            return client.call('get_essence_msg_list', { group_id: groupId });
        },
        markMessageAsRead(messageId) {
            return client.call('mark_msg_as_read', { message_id: messageId });
        },
        markGroupMsgAsRead(groupId) {
            return client.call('mark_group_msg_as_read', { group_id: groupId });
        },
        markPrivateMsgAsRead(userId) {
            return client.call('mark_private_msg_as_read', { user_id: userId });
        },
        markAllMsgAsRead() {
            return client.call('_mark_all_as_read');
        },
        getGroupAtAllRemain(groupId) {
            return client.call<number>('get_group_at_all_remain', { group_id: groupId });
        },
        getGroupSystemMsg() {
            return client.call<GroupSystemMessages>('get_group_system_msg');
        },
        getGroupHonorInfo(groupId, type) {
            return client.call<GroupHonorInfo>('get_group_honor_info', { group_id: groupId, type });
        },
        getGroupMsgHistory(params) {
            return client.call('get_group_msg_history', params);
        },
        getFriendMsgHistory(params) {
            return client.call('get_friend_msg_history', params);
        },
        getRecentContact(count) {
            return client.call('get_recent_contact', { count });
        },
        setMsgEmojiLike(messageId, emojiId, set) {
            return client.call('set_msg_emoji_like', { message_id: messageId, emoji_id: emojiId, set });
        },
        fetchEmojiLike(params) {
            return client.call('fetch_emoji_like', params);
        },
        sendGroupPoke(groupId, userId) {
            return client.call('group_poke', { group_id: groupId, user_id: userId });
        },
        sendFriendPoke(userId) {
            return client.call('friend_poke', { user_id: userId });
        },
        sendPoke(targetId, groupId) {
            return client.call('send_poke', groupId ? { group_id: groupId, target_id: targetId } : { user_id: targetId });
        },
    };
}
