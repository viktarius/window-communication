import { inject, injectable } from 'inversify';

import { TYPES } from '../inversify/types.ts';
import { GlobalPoint } from '../core/types.ts';
import { MessageType, ResponseEventType } from '../workers/shared.types.ts';

import { DrawService } from './draw.service.ts';
import { CanvasService } from './canvas.service.ts';

@injectable()
export class WindowEventService {
	private readonly worker: SharedWorker = new SharedWorker(new URL('../workers/shared.ts', import.meta.url));
	private readonly browserMoveEvent = new CustomEvent('browserMove', { detail: 'browserPosition' });

	private readonly drawService: DrawService;
	private readonly canvasService: CanvasService;

	private readonly windowId: string = (+new Date()).toString();
	private prevWindowState: any = {};
	private globalPoint: GlobalPoint = {
		globalXPosition: window.innerWidth / 2 + window.screenX,
		globalYPosition: window.innerHeight / 2 + window.screenY
	};

	private lastData: GlobalPoint[] = [];

	constructor(
		@inject(TYPES.Draw) drawService: DrawService,
		@inject(TYPES.Canvas) canvasService: CanvasService
	) {
		this.drawService = drawService;
		this.canvasService = canvasService;

		window.addEventListener('resize', () => {
			this.canvasService.updateCanvasSize();
			this.globalPoint = {
				globalXPosition: window.innerWidth / 2 + window.screenX,
				globalYPosition: window.innerHeight / 2 + window.screenY
			};
		}, false);
		window.addEventListener('browserMove', () => {
			this.sendMessage(this.globalPoint);
			this.drawService.draw(this.lastData, this.globalPoint);
		});
		setInterval(this.detectBrowserMove.bind(this), 100);

		this.drawService.draw(this.lastData, this.globalPoint);

		this.worker.port.onmessage = (e: MessageEvent<ResponseEventType>) => {
			if (e.data === MessageType.SYNC) {
				this.worker.port.postMessage({
					id: this.windowId,
					type: MessageType.SYNC
				});
			} else {
				this.lastData = e.data.filter(({ id }) => id !== this.windowId).map(({ point }) => point);
				this.drawService.draw(this.lastData, this.globalPoint);
			}
		};
	}

	private detectBrowserMove(): void {
		this.globalPoint = {
			globalXPosition: window.innerWidth / 2 + window.screenX,
			globalYPosition: window.innerHeight / 2 + window.screenY
		};

		if (window.screenX !== this.prevWindowState.screenX ||
			window.screenY !== this.prevWindowState.screenY ||
			window.innerHeight !== this.prevWindowState.innerHeight ||
			window.innerWidth !== this.prevWindowState.innerWidth) {
			this.prevWindowState = {
				screenX: window.screenX,
				screenY: window.screenY,
				innerWidth: window.innerWidth,
				innerHeight: window.innerHeight
			};
			window.dispatchEvent(this.browserMoveEvent);
		}
	}

	private sendMessage(point: GlobalPoint): void {
		this.worker.port.postMessage({
			id: this.windowId,
			type: MessageType.DATA,
			point
		});
	}
}
