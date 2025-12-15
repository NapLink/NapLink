import type { ApiClient } from '../../core/api-client';

export type SystemApi = {
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
};

export function createSystemApi(client: ApiClient): SystemApi {
    return {
        getOnlineClients(noCache = false) {
            return client.call('get_online_clients', { no_cache: noCache });
        },
        getRobotUinRange() {
            return client.call('get_robot_uin_range');
        },
        canSendImage() {
            return client.call('can_send_image');
        },
        canSendRecord() {
            return client.call('can_send_record');
        },
        getCookies(domain: string) {
            return client.call('get_cookies', { domain });
        },
        getCsrfToken() {
            return client.call('get_csrf_token');
        },
        getCredentials(domain: string) {
            return client.call('get_credentials', { domain });
        },
        setInputStatus(userId: number | string, eventType: number) {
            // NapCat 侧字段是 event_type；WebUI 里也有 eventType 的旧写法
            return client.call('set_input_status', { user_id: userId, event_type: eventType, eventType });
        },
        ocrImage(image: string, dot = false) {
            return client.call(dot ? '.ocr_image' : 'ocr_image', { image });
        },
        translateEn2zh(words: string[]) {
            return client.call('translate_en2zh', { words });
        },
        checkUrlSafely(url: string) {
            return client.call('check_url_safely', { url });
        },
        handleQuickOperation(context: any, operation: any) {
            return client.call('.handle_quick_operation', { context, operation });
        },
        getModelShow(model: string) {
            return client.call('_get_model_show', { model });
        },
        setModelShow(model: string, modelShow: string) {
            return client.call('_set_model_show', { model, model_show: modelShow });
        },
        getPacketStatus() {
            return client.call('nc_get_packet_status');
        },
    };
}

