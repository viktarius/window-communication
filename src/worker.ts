import { MessageEventType, GlobalPoint } from './types.ts';

let windowsState: Record<string, {
    point: GlobalPoint;
    port: MessagePort;
    isActive?: boolean;
}> = {};

// const ports: any[] = [];

onconnect = function (e) {
    const currentPort = e.ports[0];

    // ports.push(currentPort);

    currentPort.onmessage = (ev: MessageEvent<MessageEventType>) => {
        const message = ev.data;

        switch (message.type) {
            case 'sync':
                // console.log('sync', message.id);
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
