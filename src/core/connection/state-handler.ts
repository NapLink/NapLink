import EventEmitter from 'events';
import { ConnectionState } from './state';

/**
 * 处理连接状态变化并触发相应事件
 * @param emitter 事件发射器 (通常是 NapLink 实例)
 * @param state 新的连接状态
 * @param wasReconnecting 是否从重连状态转换而来
 */
export function handleConnectionStateChange(
    emitter: EventEmitter,
    state: ConnectionState,
    wasReconnecting: boolean = false
): void {
    emitter.emit('state_change', state);

    // 触发具体的状态事件
    switch (state) {
        case ConnectionState.CONNECTED:
            emitter.emit('connect');
            // 如果是从重连状态恢复，发送 connection:restored 事件
            if (wasReconnecting) {
                emitter.emit('connection:restored', { timestamp: Date.now() });
            }
            break;
        case ConnectionState.DISCONNECTED:
            emitter.emit('disconnect');
            break;
        case ConnectionState.RECONNECTING:
            emitter.emit('reconnecting');
            break;
    }
}
