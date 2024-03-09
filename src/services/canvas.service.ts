import { injectable } from 'inversify';
import { GlobalPoint, Point } from '../core/types.ts';

@injectable()
export class CanvasService {
    private readonly _context: CanvasRenderingContext2D;
    private readonly _canvas: HTMLCanvasElement;

    public get context(): CanvasRenderingContext2D {
        return this._context;
    }

    public get width(): number {
        return this._canvas.width;
    }

    public get height(): number {
        return this._canvas.height;
    }

    constructor() {
        console.log('test3');
        this._canvas = document.createElement('canvas');
        this.updateCanvasSize();

        const appEl = document.getElementById('app') as HTMLElement;
        appEl.append(this._canvas);

        this._context = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    public getCanvasCenterPoint(): Point {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        return { x: centerX, y: centerY };
    }

    public getOtherPointPosition(point: GlobalPoint, centerPoint: GlobalPoint): Point {
        const { globalXPosition, globalYPosition } = point;

        const centerX = globalXPosition - centerPoint.globalXPosition + window.innerWidth / 2;
        const centerY = globalYPosition - centerPoint.globalYPosition + window.innerHeight / 2;

        return { x: centerX, y: centerY };
    }


    public updateCanvasSize(): void {
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
    }
}
