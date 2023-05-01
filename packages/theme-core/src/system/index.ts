import type { SystemColorSection } from './color';
import type { TypescaleSection } from './typescale';

export * from './typescale';
export * from './color';

export interface SystemSection {
  typescale: TypescaleSection;
  color: SystemColorSection;
}
