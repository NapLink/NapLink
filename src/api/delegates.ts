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
    sendGroupForwardMessage(groupId: number | string, messages: any[]): Promise<any>;
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
        sendGroupForwardMessage: (groupId, messages) => api.sendGroupForwardMessage(groupId, messages),
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
    };

    Object.assign(target, bindings);
}
