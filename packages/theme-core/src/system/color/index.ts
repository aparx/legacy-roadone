// The system color interface shall export:
// (1) Schemes, (2) Surfaces, (3) States
import type { ElevationColorSection } from './elevation';
import type { SchemeColorSection } from './scheme';
import type { StateColorSection } from './state';
import type { SurfaceColorSection } from './surface';

export * from './scheme';
export * from './surface';
export * from './elevation';
export * from './state';

export interface SystemColorSection {
  scheme: SchemeColorSection;
  surface: SurfaceColorSection;
  state: StateColorSection;
  elevation: ElevationColorSection;
}
