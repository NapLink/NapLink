import EventEmitter from 'events';
import { ConnectionState } from './state';

/**
 * 处理连接状态变化并触发相应事件
 * @param emitter 事件发射器 (通常是 NapLink 实例)
 * @param state 新的连接状态
 */
export function handleConnectionStateChange(emitter: EventEmitter, state: ConnectionState): void {
    emitter.emit('state_change', state);

    // 触发具体的状态事件
    switch (state) {
        case ConnectionState.CONNECTED:
            emitter.emit('connect');
            break;
        case ConnectionState.DISCONNECTED:
            emitter.emit('disconnect');
            break;
        case ConnectionState.RECONNECTING:
            emitter.emit('reconnecting');
            break;
    }
}
