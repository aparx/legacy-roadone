import { TypescalePinpoint } from '../system';
import { Theme } from '../theme';

export const typescalePinpoint = (
  { sys: { typescale } }: Theme,
  pinpoint: TypescalePinpoint
) => typescale[pinpoint.role][pinpoint.size];
