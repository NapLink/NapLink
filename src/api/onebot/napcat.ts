import type { ApiClient } from '../../core/api-client';

export type NapCatApi = {
    // RKey
    getRkeyEx(): Promise<any>;
    getRkeyServer(): Promise<any>;
    getRkey(): Promise<any>;

    // 好友/群扩展
    setFriendRemark(userId: number | string, remark: string): Promise<any>;
    deleteFriend(userId: number | string): Promise<any>;
    getUnidirectionalFriendList(): Promise<any>;

    setGroupRemark(groupId: number | string, remark: string): Promise<any>;
    getGroupInfoEx(groupId: number | string): Promise<any>;
    getGroupDetailInfo(groupId: number | string): Promise<any>;
    getGroupIgnoredNotifies(): Promise<any>;
    getGroupShutList(groupId: number | string): Promise<any>;

    // 合并转发（扩展）
    sendPrivateForwardMessage(params: { user_id: number | string; messages: any[]; news?: any[]; prompt?: string; summary?: string; source?: string }): Promise<any>;
    forwardFriendSingleMsg(userId: number | string, messageId: number | string): Promise<any>;
    forwardGroupSingleMsg(groupId: number | string, messageId: number | string): Promise<any>;
    sendForwardMsg(params: { group_id?: number | string; user_id?: number | string; messages: any[]; news?: any[]; prompt?: string; summary?: string; source?: string }): Promise<any>;

    // 群公告（go-cqhttp 扩展）
    sendGroupNotice(params: {
        group_id: number | string;
        content: string;
        image?: string;
        pinned?: number | string;
        type?: number | string;
        confirm_required?: number | string;
        is_show_edit_card?: number | string;
        tip_window_type?: number | string;
    }): Promise<any>;
    getGroupNotice(groupId: number | string): Promise<any>;
    delGroupNotice(groupId: number | string, noticeId: string): Promise<any>;

    // 在线状态（扩展）
    setOnlineStatus(status: number | string, extStatus: number | string, batteryStatus: number | string): Promise<any>;
    setDiyOnlineStatus(faceId: number | string, wording?: string, faceType?: number | string): Promise<any>;

    // Ark / 小程序
    sendArkShare(params: { user_id?: number | string; group_id?: number | string; phone_number?: string }): Promise<any>;
    sendGroupArkShare(groupId: number | string): Promise<any>;
    getMiniAppArk(payload: any): Promise<any>;

    // AI 语音
    getAiCharacters(groupId: number | string, chatType?: number | string): Promise<any>;
    getAiRecord(groupId: number | string, character: string, text: string): Promise<any>;
    sendGroupAiRecord(groupId: number | string, character: string, text: string): Promise<any>;

    // 群打卡
    setGroupSign(groupId: number | string): Promise<any>;
    sendGroupSign(groupId: number | string): Promise<any>;

    // 其他
    fetchCustomFace(params?: any): Promise<any>;
    getEmojiLikes(params: { message_id: string; emoji_id: string; emoji_type?: string; group_id?: string; count?: number }): Promise<any>;
    getClientkey(): Promise<any>;
    clickInlineKeyboardButton(params: {
        group_id: number | string;
        bot_appid: string;
        button_id?: string;
        callback_data?: string;
        msg_seq?: string;
    }): Promise<any>;
};

export function createNapCatApi(client: ApiClient): NapCatApi {
    return {
        getRkeyEx() {
            return client.call('get_rkey');
        },
        getRkeyServer() {
            return client.call('get_rkey_server');
        },
        getRkey() {
            return client.call('nc_get_rkey');
        },
        setFriendRemark(userId, remark) {
            return client.call('set_friend_remark', { user_id: userId, remark });
        },
        deleteFriend(userId) {
            return client.call('delete_friend', { user_id: userId });
        },
        getUnidirectionalFriendList() {
            return client.call('get_unidirectional_friend_list');
        },
        setGroupRemark(groupId, remark) {
            return client.call('set_group_remark', { group_id: String(groupId), remark });
        },
        getGroupInfoEx(groupId) {
            return client.call('get_group_info_ex', { group_id: groupId });
        },
        getGroupDetailInfo(groupId) {
            return client.call('get_group_detail_info', { group_id: groupId });
        },
        getGroupIgnoredNotifies() {
            return client.call('get_group_ignored_notifies');
        },
        getGroupShutList(groupId) {
            return client.call('get_group_shut_list', { group_id: groupId });
        },
        sendPrivateForwardMessage(params) {
            return client.call('send_private_forward_msg', params);
        },
        forwardFriendSingleMsg(userId, messageId) {
            return client.call('forward_friend_single_msg', { user_id: userId, message_id: messageId });
        },
        forwardGroupSingleMsg(groupId, messageId) {
            return client.call('forward_group_single_msg', { group_id: groupId, message_id: messageId });
        },
        sendForwardMsg(params) {
            return client.call('send_forward_msg', params);
        },
        sendGroupNotice(params) {
            return client.call('_send_group_notice', params);
        },
        getGroupNotice(groupId) {
            return client.call('_get_group_notice', { group_id: groupId });
        },
        delGroupNotice(groupId, noticeId) {
            return client.call('_del_group_notice', { group_id: groupId, notice_id: +noticeId });
        },
        setOnlineStatus(status, extStatus, batteryStatus) {
            return client.call('set_online_status', { status, ext_status: extStatus, battery_status: batteryStatus });
        },
        setDiyOnlineStatus(faceId, wording = ' ', faceType = 1) {
            return client.call('set_diy_online_status', { face_id: faceId, wording, face_type: faceType });
        },
        sendArkShare(params) {
            return client.call('send_ark_share', params);
        },
        sendGroupArkShare(groupId) {
            return client.call('send_group_ark_share', { group_id: groupId });
        },
        getMiniAppArk(payload: any) {
            return client.call('get_mini_app_ark', payload);
        },
        getAiCharacters(groupId, chatType = 1) {
            return client.call('get_ai_characters', { group_id: groupId, chat_type: chatType });
        },
        getAiRecord(groupId, character, text) {
            return client.call('get_ai_record', { group_id: groupId, character, text });
        },
        sendGroupAiRecord(groupId, character, text) {
            return client.call('send_group_ai_record', { group_id: groupId, character, text });
        },
        setGroupSign(groupId) {
            return client.call('set_group_sign', { group_id: groupId });
        },
        sendGroupSign(groupId) {
            return client.call('send_group_sign', { group_id: groupId });
        },
        fetchCustomFace(params) {
            return client.call('fetch_custom_face', params ?? {});
        },
        getEmojiLikes(params) {
            return client.call('get_emoji_likes', params);
        },
        getClientkey() {
            return client.call('get_clientkey');
        },
        clickInlineKeyboardButton(params) {
            return client.call('click_inline_keyboard_button', {
                ...params,
                button_id: params.button_id ?? '',
                callback_data: params.callback_data ?? '',
                msg_seq: params.msg_seq ?? '10086',
            });
        },
    };
}
