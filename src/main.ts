import './style.css';

import {container} from './inversify/inversify.config.ts';
import { TYPES } from './inversify/types.ts';

container.get(TYPES.WindowEvent);
