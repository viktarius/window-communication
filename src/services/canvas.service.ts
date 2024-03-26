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
		this._canvas = document.createElement('canvas');
		this.updateCanvasSize();

		const appEl: HTMLElement = document.getElementById('my-app')!;
		appEl.append(this._canvas);

		this._context = this._canvas.getContext('2d')!;
	}

	public getCanvasCenterPoint(): Point {
		const x = this.width / 2;
		const y = this.height / 2;

		return { x, y };
	}

	public getOtherPointPosition(point: GlobalPoint, centerPoint: GlobalPoint): Point {
		const {
			globalXPosition,
			globalYPosition
		} = point;

		const x = globalXPosition - centerPoint.globalXPosition + window.innerWidth / 2;
		const y = globalYPosition - centerPoint.globalYPosition + window.innerHeight / 2;

		return { x, y };
	}

	public updateCanvasSize(): void {
		this._canvas.width = window.innerWidth;
		this._canvas.height = window.innerHeight;
	}
}
