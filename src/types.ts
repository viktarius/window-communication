export type GlobalPoint = {
    globalXPosition: number;
    globalYPosition: number;
};

export interface Point {
    centerX: number;
    centerY: number;
}

export enum MessageType {
    SYNC = 'sync',
    DATA = 'data'
}

export type SyncEventType = {
    type: MessageType.SYNC,
    id: string,
}

export type DataEventType = {
    type: MessageType.DATA,
    id: string,
    point: GlobalPoint,
}

export type MessageEventType = SyncEventType | DataEventType;