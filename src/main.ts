import './style.css';

import { MessageType, GlobalPoint, Point } from './types.ts';

const worker: SharedWorker = new SharedWorker(new URL('./worker.ts', import.meta.url));

const canvas = document.createElement('canvas');
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.setAttribute('id', 'canvas');

const appEl = document.getElementById('app') as HTMLElement;
appEl.append(canvas);

const context = canvas.getContext('2d') as CanvasRenderingContext2D;

const { centerX, centerY } = getCurrentWindowCenterPoint();
drawCircle(context, centerX, centerY);

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    /**
     * Your drawings need to be inside this function otherwise they will be reset when
     * you resize the browser window and the canvas goes will be cleared.
     */
    // drawStuff();
}

resizeCanvas();

const windowId = (+new Date()).toString();
worker.port.start();

let currentGlobalXPosition: number = window.innerWidth / 2 + window.screenX;
let currentGlobalYPosition: number = window.innerHeight / 2 + window.screenY;


let point: GlobalPoint = {
    globalXPosition: currentGlobalXPosition,
    globalYPosition: currentGlobalYPosition,
};

worker.port.postMessage({
    id: windowId,
    type: MessageType.DATA,
    point
})

let lastData: GlobalPoint[] = [];

worker.port.onmessage = (e: MessageEvent<{ id: string, point: GlobalPoint }[] | MessageType.SYNC>) => {
    console.log(e.data);
    if (e.data === MessageType.SYNC) {
        worker.port.postMessage({
            id: windowId,
            type: MessageType.SYNC,
        })
    } else {
        lastData = e.data.filter(({ id }) => id !== windowId).map(({ point }) => point);
        draw(context);
    }

};

const event = new CustomEvent('browserMove', { detail: 'browserPosition' });
setInterval(detectBrowserMove, 200);

let windowState: any = {};

function detectBrowserMove() {
    currentGlobalXPosition = window.innerWidth / 2 + window.screenX;
    currentGlobalYPosition = window.innerHeight / 2 + window.screenY;

    point = {
        globalXPosition: currentGlobalXPosition,
        globalYPosition: currentGlobalYPosition,
    };

    if (window.screenX !== windowState.screenX ||
        window.screenY !== windowState.screenY ||
        window.innerHeight !== windowState.innerHeight ||
        window.innerWidth !== windowState.innerWidth) {

        windowState = {
            screenX: window.screenX,
            screenY: window.screenY,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
        }
        window.dispatchEvent(event);
    }
}

window.addEventListener('browserMove', function () {
    worker.port.postMessage({
        id: windowId,
        type: MessageType.DATA,
        point
    })
    draw(context);
});

const radius = 50;

function draw(context: CanvasRenderingContext2D): void {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const points: { centerX: number; centerY: number; }[] = lastData.map(point => getOtherWindowCenterPoint(point))
    points.push(getCurrentWindowCenterPoint());

    points.forEach(({ centerX, centerY }) => {
        drawCircle(context, centerX, centerY)
    })
    const lines: [{ centerX: number; centerY: number; }, { centerX: number; centerY: number; }][] = [];
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            lines.push([points[i], points[j]])
        }
    }
    lines.forEach(line => drawLine(context, line))
}

function drawCircle(context: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    setTimeout(() => {
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'green';
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = '#003300';
        context.stroke();
    })
}

function drawLine(context: CanvasRenderingContext2D, line: [Point, Point]): void {
    setTimeout(() => {
        context.beginPath(); // Start a new path
        context.moveTo(line[0].centerX, line[0].centerY);
        context.lineTo(line[1].centerX, line[1].centerY);
        context.stroke(); // Render the path
    })
}

function getCurrentWindowCenterPoint(): Point {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    return { centerX, centerY };
}

function getOtherWindowCenterPoint(point: GlobalPoint): Point {
    const { globalXPosition, globalYPosition } = point;

    const centerX = globalXPosition - currentGlobalXPosition + window.innerWidth / 2;
    const centerY = globalYPosition - currentGlobalYPosition + window.innerHeight / 2;

    return { centerX, centerY };
}
