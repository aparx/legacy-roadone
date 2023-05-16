import { maxSurfaceLevel } from './surface';
import type { TupleOf } from 'shared-utils/src';

export const maxElevationLevel = maxSurfaceLevel;

export type ElevationColorSection = TupleOf<string, typeof maxElevationLevel>;
