import { GlobalPoint } from '../core/types.ts';

export enum MessageType {
    SYNC = 'sync',
    DATA = 'data'
}

export interface IWindowState {
    point: GlobalPoint;
    port: MessagePort;
    isActive?: boolean;
}

interface SyncEventRequest {
    type: MessageType.SYNC;
    id: string;
}

interface DataEventRequest {
    type: MessageType.DATA;
    id: string;
    point: GlobalPoint;
}

interface DrawEventResponse {
    id: string;
    point: GlobalPoint;
}

export type RequestEventType = SyncEventRequest | DataEventRequest;
export type ResponseEventType = DrawEventResponse[] | MessageType.SYNC;
