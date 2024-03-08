import { GlobalPoint } from '../core/types.ts';
import { DrawService } from './draw.service.ts';
import { MessageType, ResponseEventType } from '../workers/shared.types.ts';

export class WindowEventService {
    private worker: SharedWorker = new SharedWorker(new URL('../workers/shared.ts', import.meta.url))
    private browserMoveEvent = new CustomEvent('browserMove', { detail: 'browserPosition' });

    private drawService: DrawService;

    private windowId: string = (+new Date).toString();
    private prevWindowState: any = {};
    private globalPoint: GlobalPoint = {
        globalXPosition: window.innerWidth / 2 + window.screenX,
        globalYPosition: window.innerHeight / 2 + window.screenY,
    };
    private lastData: GlobalPoint[] = [];

    constructor() {
        this.drawService = new DrawService();

        window.addEventListener('resize', () => {
            this.drawService.updateCanvasSize();
            this.globalPoint = {
                globalXPosition: window.innerWidth / 2 + window.screenX,
                globalYPosition: window.innerHeight / 2 + window.screenY,
            }
        }, false);
        window.addEventListener('browserMove', () => {
            console.log(this.globalPoint);
            this.sendMessage(this.globalPoint);
            this.drawService.draw(this.lastData, this.globalPoint);
        });
        setInterval(this.detectBrowserMove.bind(this), 200);

        this.drawService.draw(this.lastData, this.globalPoint);

        this.worker.port.onmessage = (e: MessageEvent<ResponseEventType>) => {
            if (e.data === MessageType.SYNC) {
                this.worker.port.postMessage({
                    id: this.windowId,
                    type: MessageType.SYNC,
                })
            } else {
                this.lastData = e.data.filter(({ id }) => id !== this.windowId).map(({ point }) => point);
                this.drawService.draw(this.lastData, this.globalPoint);
            }
        };
    }

    private detectBrowserMove(): void {
        this.globalPoint = {
            globalXPosition: window.innerWidth / 2 + window.screenX,
            globalYPosition: window.innerHeight / 2 + window.screenY,
        };

        if (window.screenX !== this.prevWindowState.screenX ||
            window.screenY !== this.prevWindowState.screenY ||
            window.innerHeight !== this.prevWindowState.innerHeight ||
            window.innerWidth !== this.prevWindowState.innerWidth) {

            this.prevWindowState = {
                screenX: window.screenX,
                screenY: window.screenY,
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
            }
            window.dispatchEvent(this.browserMoveEvent);
        }
    }

    private sendMessage(point: GlobalPoint) {
        this.worker.port.postMessage({
            id: this.windowId,
            type: MessageType.DATA,
            point
        })
    }
}
