import { GlobalPoint, Point } from '../core/types.ts';
import { RADIUS } from '../core/constants.ts';
import { CanvasService } from './canvas.service.ts';

export class DrawService {
    private canvasService: CanvasService;

    constructor() {
        this.canvasService = new CanvasService();
    }

    public draw(lastData: GlobalPoint[], currentPoint: GlobalPoint) {
        this.canvasService.context.clearRect(0, 0, this.canvasService.width, this.canvasService.height);

        const points: Point[] = lastData.map(point => this.canvasService.getOtherPointPosition(point, currentPoint))
        points.push(this.canvasService.getCanvasCenterPoint());
        points.forEach(({ x, y }) => {
            this.drawCircle(x, y)
        })
        const lines: [Point, Point][] = [];
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                lines.push([points[i], points[j]])
            }
        }
        lines.forEach(line => this.drawLine(line))
    }

    private drawCircle(centerX: number, centerY: number): void {
        setTimeout(() => {
            this.canvasService.context.beginPath();
            this.canvasService.context.arc(centerX, centerY, RADIUS, 0, 2 * Math.PI, false);
            this.canvasService.context.fillStyle = 'green';
            this.canvasService.context.fill();
            this.canvasService.context.lineWidth = 5;
            this.canvasService.context.strokeStyle = '#003300';
            this.canvasService.context.stroke();
        })
    }

    private drawLine(line: [Point, Point]): void {
        setTimeout(() => {
            this.canvasService.context.beginPath();
            this.canvasService.context.moveTo(line[0].x, line[0].y);
            this.canvasService.context.lineTo(line[1].x, line[1].y);
            this.canvasService.context.stroke();
        })
    }

    // TODO: remove after add inversify
    public updateCanvasSize(): void {
        this.canvasService.updateCanvasSize();
    }

}
