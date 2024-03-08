import { GlobalPoint } from '../core/types.ts';
import { IWindowState, RequestEventType } from './shared.types.ts';

let windowsState: Record<string, IWindowState> = {};

onconnect = function (e) {
    const currentPort = e.ports[0];

    currentPort.onmessage = (ev: MessageEvent<RequestEventType>) => {
        const message = ev.data;

        switch (message.type) {
            case 'sync':
                windowsState[message.id].isActive = true;
                break;
            case 'data':
                windowsState[message.id] = {
                    isActive: true,
                    point: message.point,
                    port: currentPort,
                };
                const ports = Object.entries(windowsState).map(([, value]) => value.port);
                const dataToMessage = Object.entries(windowsState).reduce((acc: {
                    id: string,
                    point: GlobalPoint
                }[], [key, value]) => {
                    acc.push({ id: key, point: value.point });
                    return acc;
                }, []);
                ports.forEach((port) => {
                    if (port !== currentPort) {
                        port.postMessage(dataToMessage)
                    }
                })
                break;
        }

    }
}

setInterval(() => {
    windowsState = Object.fromEntries(Object.entries(windowsState).filter(([, value]) => value.isActive).map(([key, state]) => ([key, {
        ...state,
        isActive: false
    }])));
    const ports = Object.entries(windowsState).map(([, value]) => value.port);
    ports.forEach((port) => {
        port.postMessage('sync')
    })
}, 200)
