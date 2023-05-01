import type { TupleOf } from 'shared-utils/src';

export const maxSurfaceLevel = 6;

export type SurfaceColorSection = TupleOf<string, typeof maxSurfaceLevel>;
