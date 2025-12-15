import type { OneBotApi } from './index';

/**
 * 统一封装 OneBot API 代理，避免 NapLink 主类塞满转发方法。
 * 通过 bindOneBotApiMethods 在实例上动态挂载对应方法，保持对外 API 不变。
 */
export type OneBotApiMethods = {
    getLoginInfo(): Promise<any>;
    getStatus(): Promise<any>;
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
    getEssenceMessageList(groupId: number | string): Promise<any>;
    markMessageAsRead(messageId: number | string): Promise<any>;
    markGroupMsgAsRead(groupId: number | string): Promise<any>;
    markPrivateMsgAsRead(userId: number | string): Promise<any>;
    markAllMsgAsRead(): Promise<any>;
    getGroupAtAllRemain(groupId: number | string): Promise<any>;
    getGroupSystemMsg(): Promise<any>;
    getGroupHonorInfo(
        groupId: number | string,
        type: 'all' | 'talkative' | 'performer' | 'legend' | 'strong_newbie' | 'emotion'
    ): Promise<any>;
    getGroupFileSystemInfo(groupId: number | string): Promise<any>;
    getGroupRootFiles(groupId: number | string): Promise<any>;
    getGroupFilesByFolder(groupId: number | string, folderId: string): Promise<any>;
    getGroupFileUrl(groupId: number | string, fileId: string, busid?: number): Promise<any>;
    deleteGroupFile(groupId: number | string, fileId: string, busid?: number): Promise<any>;
    createGroupFileFolder(groupId: number | string, name: string, parentId?: string): Promise<any>;
    deleteGroupFolder(groupId: number | string, folderId: string): Promise<any>;
    downloadFile(url: string, threadCount?: number, headers?: Record<string, string>): Promise<any>;
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
    downloadFileStream(fileId: string, options?: { chunkSize?: number }): { packets: AsyncIterable<any>; result: Promise<any> };
    downloadFileStreamToFile(fileId: string, options?: { chunkSize?: number; filename?: string }): Promise<{ path: string; info?: any }>;
    downloadFileImageStream(fileId: string, options?: { chunkSize?: number }): { packets: AsyncIterable<any>; result: Promise<any> };
    downloadFileImageStreamToFile(fileId: string, options?: { chunkSize?: number; filename?: string }): Promise<{ path: string; info?: any }>;
    downloadFileRecordStream(fileId: string, outFormat?: string, options?: { chunkSize?: number; filename?: string }): { packets: AsyncIterable<any>; result: Promise<any> };
    downloadFileRecordStreamToFile(fileId: string, outFormat?: string, options?: { chunkSize?: number; filename?: string }): Promise<{ path: string; info?: any }>;
    cleanStreamTempFile(): Promise<any>;
    sendGroupForwardMessage(groupId: number | string, messages: any[]): Promise<any>;
    getGroupMsgHistory(params: { group_id: number | string; message_seq: number | string; count: number; reverse_order?: boolean }): Promise<any>;
    getFriendMsgHistory(params: { user_id: number | string; message_seq: number | string; count: number; reverse_order?: boolean }): Promise<any>;
    getRecentContact(count: number): Promise<any>;
    setMsgEmojiLike(messageId: number | string, emojiId: number, set: boolean): Promise<any>;
    fetchEmojiLike(params: { message_id: number | string; emojiId: string; emojiType: string; group_id?: number | string; user_id?: number | string; count?: number }): Promise<any>;
    sendGroupPoke(groupId: number | string, userId: number | string): Promise<any>;
    sendFriendPoke(userId: number | string): Promise<any>;
    sendPoke(targetId: number | string, groupId?: number | string): Promise<any>;
    getImage(file: string): Promise<any>;
    getRecord(file: string, outFormat?: string): Promise<any>;
    getFile(file: string): Promise<any>;
    getFriendList(): Promise<any>;
    getGroupList(): Promise<any>;
    getGroupInfo(groupId: number | string, noCache?: boolean): Promise<any>;
    getGroupMemberList(groupId: number | string): Promise<any>;
    getGroupMemberInfo(groupId: number | string, userId: number | string, noCache?: boolean): Promise<any>;
    setGroupBan(groupId: number | string, userId: number | string, duration?: number): Promise<any>;
    unsetGroupBan(groupId: number | string, userId: number | string): Promise<any>;
    setGroupWholeBan(groupId: number | string, enable?: boolean): Promise<any>;
    setGroupKick(groupId: number | string, userId: number | string, rejectAddRequest?: boolean): Promise<any>;
    setGroupLeave(groupId: number | string, isDismiss?: boolean): Promise<any>;
    setGroupCard(groupId: number | string, userId: number | string, card: string): Promise<any>;
    setGroupName(groupId: number | string, groupName: string): Promise<any>;
    setGroupPortrait(groupId: number | string, file: string | Buffer | Uint8Array | NodeJS.ReadableStream): Promise<any>;
    setGroupAdmin(groupId: number | string, userId: number | string, enable?: boolean): Promise<any>;
    setGroupAnonymousBan(groupId: number | string, anonymousFlag: string, duration?: number): Promise<any>;
    setEssenceMessage(messageId: number | string): Promise<any>;
    deleteEssenceMessage(messageId: number | string): Promise<any>;
    setGroupSpecialTitle(
        groupId: number | string,
        userId: number | string,
        specialTitle: string,
        duration?: number
    ): Promise<any>;
    sendLike(userId: number | string, times?: number): Promise<any>;
    uploadGroupFile(groupId: number | string, file: string, name: string): Promise<any>;
    uploadPrivateFile(userId: number | string, file: string, name: string): Promise<any>;
    getStrangerInfo(userId: number | string, noCache?: boolean): Promise<any>;
    getVersionInfo(): Promise<any>;
    handleFriendRequest(flag: string, approve?: boolean, remark?: string): Promise<any>;
    handleGroupRequest(flag: string, subType: 'add' | 'invite', approve?: boolean, reason?: string): Promise<any>;

    // SystemApi (NapCat / go-cqhttp 扩展)
    getOnlineClients(noCache?: boolean): Promise<any>;
    getRobotUinRange(): Promise<any>;
    canSendImage(): Promise<any>;
    canSendRecord(): Promise<any>;
    getCookies(domain: string): Promise<any>;
    getCsrfToken(): Promise<any>;
    getCredentials(domain: string): Promise<any>;
    setInputStatus(userId: number | string, eventType: number): Promise<any>;
    ocrImage(image: string, dot?: boolean): Promise<any>;
    translateEn2zh(words: string[]): Promise<any>;
    checkUrlSafely(url: string): Promise<any>;
    handleQuickOperation(context: any, operation: any): Promise<any>;
    getModelShow(model: string): Promise<any>;
    setModelShow(model: string, modelShow: string): Promise<any>;
    getPacketStatus(): Promise<any>;

    // NapCatApi (扩展能力合集)
    getRkeyEx(): Promise<any>;
    getRkeyServer(): Promise<any>;
    getRkey(): Promise<any>;
    setFriendRemark(userId: number | string, remark: string): Promise<any>;
    deleteFriend(userId: number | string): Promise<any>;
    getUnidirectionalFriendList(): Promise<any>;
    setGroupRemark(groupId: number | string, remark: string): Promise<any>;
    getGroupInfoEx(groupId: number | string): Promise<any>;
    getGroupDetailInfo(groupId: number | string): Promise<any>;
    getGroupIgnoredNotifies(): Promise<any>;
    getGroupShutList(groupId: number | string): Promise<any>;
    sendPrivateForwardMessage(params: { user_id: number | string; messages: any[]; news?: any[]; prompt?: string; summary?: string; source?: string }): Promise<any>;
    forwardFriendSingleMsg(userId: number | string, messageId: number | string): Promise<any>;
    forwardGroupSingleMsg(groupId: number | string, messageId: number | string): Promise<any>;
    sendForwardMsg(params: { group_id?: number | string; user_id?: number | string; messages: any[]; news?: any[]; prompt?: string; summary?: string; source?: string }): Promise<any>;
    sendGroupNotice(params: { group_id: number | string; content: string; image?: string; pinned?: number | string; type?: number | string; confirm_required?: number | string; is_show_edit_card?: number | string; tip_window_type?: number | string }): Promise<any>;
    getGroupNotice(groupId: number | string): Promise<any>;
    delGroupNotice(groupId: number | string, noticeId: string): Promise<any>;
    setOnlineStatus(status: number | string, extStatus: number | string, batteryStatus: number | string): Promise<any>;
    setDiyOnlineStatus(faceId: number | string, wording?: string, faceType?: number | string): Promise<any>;
    sendArkShare(params: { user_id?: number | string; group_id?: number | string; phone_number?: string }): Promise<any>;
    sendGroupArkShare(groupId: number | string): Promise<any>;
    getMiniAppArk(payload: any): Promise<any>;
    getAiCharacters(groupId: number | string, chatType?: number | string): Promise<any>;
    getAiRecord(groupId: number | string, character: string, text: string): Promise<any>;
    sendGroupAiRecord(groupId: number | string, character: string, text: string): Promise<any>;
    setGroupSign(groupId: number | string): Promise<any>;
    sendGroupSign(groupId: number | string): Promise<any>;
    getClientkey(): Promise<any>;
    clickInlineKeyboardButton(params: { group_id: number | string; bot_appid: string; button_id?: string; callback_data?: string; msg_seq?: string }): Promise<any>;
};

export function bindOneBotApiMethods(api: OneBotApi, target: any): void {
    const bindings: Partial<OneBotApiMethods> = {
        getLoginInfo: () => api.getLoginInfo(),
        getStatus: () => api.getStatus(),
        sendMessage: (params) => api.sendMessage(params),
        sendPrivateMessage: (userId, message) => api.sendPrivateMessage(userId, message),
        sendGroupMessage: (groupId, message) => api.sendGroupMessage(groupId, message),
        deleteMessage: (messageId) => api.deleteMessage(messageId),
        getMessage: (messageId) => api.getMessage(messageId),
        getForwardMessage: (id) => api.getForwardMessage(id),
        getEssenceMessageList: (groupId) => api.getEssenceMessageList(groupId),
        markMessageAsRead: (messageId) => api.markMessageAsRead(messageId),
        markGroupMsgAsRead: (groupId) => api.markGroupMsgAsRead(groupId),
        markPrivateMsgAsRead: (userId) => api.markPrivateMsgAsRead(userId),
        markAllMsgAsRead: () => api.markAllMsgAsRead(),
        getGroupAtAllRemain: (groupId) => api.getGroupAtAllRemain(groupId),
        getGroupSystemMsg: () => api.getGroupSystemMsg(),
        getGroupHonorInfo: (groupId, type) => api.getGroupHonorInfo(groupId, type),
        getGroupFileSystemInfo: (groupId) => api.getGroupFileSystemInfo(groupId),
        getGroupRootFiles: (groupId) => api.getGroupRootFiles(groupId),
        getGroupFilesByFolder: (groupId, folderId) => api.getGroupFilesByFolder(groupId, folderId),
        getGroupFileUrl: (groupId, fileId, busid) => api.getGroupFileUrl(groupId, fileId, busid),
        deleteGroupFile: (groupId, fileId, busid) => api.deleteGroupFile(groupId, fileId, busid),
        createGroupFileFolder: (groupId, name, parentId) => api.createGroupFileFolder(groupId, name, parentId),
        deleteGroupFolder: (groupId, folderId) => api.deleteGroupFolder(groupId, folderId),
        downloadFile: (url, threadCount, headers) => api.downloadFile(url, threadCount, headers),
        uploadFileStream: (file, options) => api.uploadFileStream(file, options),
        getUploadStreamStatus: (streamId) => api.getUploadStreamStatus(streamId),
        downloadFileStream: (fileId, options) => api.downloadFileStream(fileId, options),
        downloadFileStreamToFile: (fileId, options) => api.downloadFileStreamToFile(fileId, options),
        downloadFileImageStream: (fileId, options) => api.downloadFileImageStream(fileId, options),
        downloadFileImageStreamToFile: (fileId, options) => api.downloadFileImageStreamToFile(fileId, options),
        downloadFileRecordStream: (fileId, outFormat, options) => api.downloadFileRecordStream(fileId, outFormat, options),
        downloadFileRecordStreamToFile: (fileId, outFormat, options) => api.downloadFileRecordStreamToFile(fileId, outFormat, options),
        cleanStreamTempFile: () => api.cleanStreamTempFile(),
        sendGroupForwardMessage: (groupId, messages) => api.sendGroupForwardMessage(groupId, messages),
        getGroupMsgHistory: (params) => api.getGroupMsgHistory(params),
        getFriendMsgHistory: (params) => api.getFriendMsgHistory(params),
        getRecentContact: (count) => api.getRecentContact(count),
        setMsgEmojiLike: (messageId, emojiId, set) => api.setMsgEmojiLike(messageId, emojiId, set),
        fetchEmojiLike: (params) => api.fetchEmojiLike(params),
        sendGroupPoke: (groupId, userId) => api.sendGroupPoke(groupId, userId),
        sendFriendPoke: (userId) => api.sendFriendPoke(userId),
        sendPoke: (targetId, groupId) => api.sendPoke(targetId, groupId),
        getImage: (file) => api.getImage(file),
        getRecord: (file, outFormat) => api.getRecord(file, outFormat),
        getFile: (file) => api.getFile(file),
        getFriendList: () => api.getFriendList(),
        getGroupList: () => api.getGroupList(),
        getGroupInfo: (groupId, noCache = false) => api.getGroupInfo(groupId, noCache),
        getGroupMemberList: (groupId) => api.getGroupMemberList(groupId),
        getGroupMemberInfo: (groupId, userId, noCache = false) => api.getGroupMemberInfo(groupId, userId, noCache),
        setGroupBan: (groupId, userId, duration = 30 * 60) => api.setGroupBan(groupId, userId, duration),
        unsetGroupBan: (groupId, userId) => api.unsetGroupBan(groupId, userId),
        setGroupWholeBan: (groupId, enable = true) => api.setGroupWholeBan(groupId, enable),
        setGroupKick: (groupId, userId, rejectAddRequest = false) => api.setGroupKick(groupId, userId, rejectAddRequest),
        setGroupLeave: (groupId, isDismiss = false) => api.setGroupLeave(groupId, isDismiss),
        setGroupCard: (groupId, userId, card) => api.setGroupCard(groupId, userId, card),
        setGroupName: (groupId, groupName) => api.setGroupName(groupId, groupName),
        setGroupPortrait: (groupId, file) => api.setGroupPortrait(groupId, file),
        setGroupAdmin: (groupId, userId, enable = true) => api.setGroupAdmin(groupId, userId, enable),
        setGroupAnonymousBan: (groupId, anonymousFlag, duration = 30 * 60) =>
            api.setGroupAnonymousBan(groupId, anonymousFlag, duration),
        setEssenceMessage: (messageId) => api.setEssenceMessage(messageId),
        deleteEssenceMessage: (messageId) => api.deleteEssenceMessage(messageId),
        setGroupSpecialTitle: (groupId, userId, specialTitle, duration = -1) =>
            api.setGroupSpecialTitle(groupId, userId, specialTitle, duration),
        sendLike: (userId, times = 1) => api.sendLike(userId, times),
        uploadGroupFile: (groupId, file, name) => api.uploadGroupFile(groupId, file, name),
        uploadPrivateFile: (userId, file, name) => api.uploadPrivateFile(userId, file, name),
        getStrangerInfo: (userId, noCache = false) => api.getStrangerInfo(userId, noCache),
        getVersionInfo: () => api.getVersionInfo(),
        handleFriendRequest: (flag, approve = true, remark?: string) => api.handleFriendRequest(flag, approve, remark),
        handleGroupRequest: (flag, subType, approve = true, reason?: string) =>
            api.handleGroupRequest(flag, subType, approve, reason),

        // SystemApi
        getOnlineClients: (noCache = false) => (api as any).getOnlineClients(noCache),
        getRobotUinRange: () => (api as any).getRobotUinRange(),
        canSendImage: () => (api as any).canSendImage(),
        canSendRecord: () => (api as any).canSendRecord(),
        getCookies: (domain) => (api as any).getCookies(domain),
        getCsrfToken: () => (api as any).getCsrfToken(),
        getCredentials: (domain) => (api as any).getCredentials(domain),
        setInputStatus: (userId, eventType) => (api as any).setInputStatus(userId, eventType),
        ocrImage: (image, dot) => (api as any).ocrImage(image, dot),
        translateEn2zh: (words) => (api as any).translateEn2zh(words),
        checkUrlSafely: (url) => (api as any).checkUrlSafely(url),
        handleQuickOperation: (context, operation) => (api as any).handleQuickOperation(context, operation),
        getModelShow: (model) => (api as any).getModelShow(model),
        setModelShow: (model, modelShow) => (api as any).setModelShow(model, modelShow),
        getPacketStatus: () => (api as any).getPacketStatus(),

        // NapCatApi
        getRkeyEx: () => (api as any).getRkeyEx(),
        getRkeyServer: () => (api as any).getRkeyServer(),
        getRkey: () => (api as any).getRkey(),
        setFriendRemark: (userId, remark) => (api as any).setFriendRemark(userId, remark),
        deleteFriend: (userId) => (api as any).deleteFriend(userId),
        getUnidirectionalFriendList: () => (api as any).getUnidirectionalFriendList(),
        setGroupRemark: (groupId, remark) => (api as any).setGroupRemark(groupId, remark),
        getGroupInfoEx: (groupId) => (api as any).getGroupInfoEx(groupId),
        getGroupDetailInfo: (groupId) => (api as any).getGroupDetailInfo(groupId),
        getGroupIgnoredNotifies: () => (api as any).getGroupIgnoredNotifies(),
        getGroupShutList: (groupId) => (api as any).getGroupShutList(groupId),
        sendPrivateForwardMessage: (params) => (api as any).sendPrivateForwardMessage(params),
        forwardFriendSingleMsg: (userId, messageId) => (api as any).forwardFriendSingleMsg(userId, messageId),
        forwardGroupSingleMsg: (groupId, messageId) => (api as any).forwardGroupSingleMsg(groupId, messageId),
        sendForwardMsg: (params) => (api as any).sendForwardMsg(params),
        sendGroupNotice: (params) => (api as any).sendGroupNotice(params),
        getGroupNotice: (groupId) => (api as any).getGroupNotice(groupId),
        delGroupNotice: (groupId, noticeId) => (api as any).delGroupNotice(groupId, noticeId),
        setOnlineStatus: (status, extStatus, batteryStatus) => (api as any).setOnlineStatus(status, extStatus, batteryStatus),
        setDiyOnlineStatus: (faceId, wording, faceType) => (api as any).setDiyOnlineStatus(faceId, wording, faceType),
        sendArkShare: (params) => (api as any).sendArkShare(params),
        sendGroupArkShare: (groupId) => (api as any).sendGroupArkShare(groupId),
        getMiniAppArk: (payload) => (api as any).getMiniAppArk(payload),
        getAiCharacters: (groupId, chatType) => (api as any).getAiCharacters(groupId, chatType),
        getAiRecord: (groupId, character, text) => (api as any).getAiRecord(groupId, character, text),
        sendGroupAiRecord: (groupId, character, text) => (api as any).sendGroupAiRecord(groupId, character, text),
        setGroupSign: (groupId) => (api as any).setGroupSign(groupId),
        sendGroupSign: (groupId) => (api as any).sendGroupSign(groupId),
        getClientkey: () => (api as any).getClientkey(),
        clickInlineKeyboardButton: (params) => (api as any).clickInlineKeyboardButton(params),
    };

    Object.assign(target, bindings);
}
