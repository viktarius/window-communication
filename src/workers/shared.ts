import { GlobalPoint } from '../core/types.ts';

import { IWindowState, RequestEventType } from './shared.types.ts';

let windowsState: Record<string, IWindowState> = {};
// @ts-expect-error
onconnect = function(e) {
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
					port: currentPort
				};
				const ports = Object.entries(windowsState).map(([, { port }]) => port);
				const dataToMessage = Object.entries(windowsState).reduce((acc: Array<{
					id: string,
					point: GlobalPoint,
				}>, [key, { point }]) => {
					acc.push({
						id: key,
						point
					});
					return acc;
				}, []);
				ports.forEach((port) => {
					port.postMessage(dataToMessage);
				});
				break;
		}
	};
};

setInterval(() => {
	let isNeedSendData = false;
	windowsState = Object.fromEntries(
		Object.entries(windowsState)
			.filter(([, { isActive }]) => {
				if (!isActive) {
					isNeedSendData = true;
				}
				return isActive;
			})
			.map(([key, state]) => ([key, {
				...state,
				isActive: false
			}]))
	);
	const ports = Object.entries(windowsState).map(([, { port }]) => port);
	ports.forEach((port) => {
		port.postMessage('sync');
	});
	if (isNeedSendData) {
		const dataToMessage = Object.entries(windowsState).reduce((acc: Array<{
			id: string,
			point: GlobalPoint,
		}>, [key, { point }]) => {
			acc.push({
				id: key,
				point
			});
			return acc;
		}, []);
		ports.forEach((port) => {
			port.postMessage(dataToMessage);
		});
	}
}, 200);
