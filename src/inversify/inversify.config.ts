import 'reflect-metadata';
import { Container } from 'inversify';

import { DrawService } from '../services/draw.service.ts';
import { CanvasService } from '../services/canvas.service.ts';
import { WindowEventService } from '../services/window-event.service.ts';

import { TYPES } from './types';

const container = new Container();

container.bind(TYPES.Draw).to(DrawService).inSingletonScope();
container.bind(TYPES.Canvas).to(CanvasService).inSingletonScope();
container.bind(TYPES.WindowEvent).to(WindowEventService);

export { container };
