import { OpacityEmphasis, ReferenceSection } from '../../reference';
import { colord } from 'colord';

export class RuntimeEmphasis {
  constructor(private readonly ref: ReferenceSection) {}

  emphasize(
    color: string,
    emphasis: OpacityEmphasis = 'high'
  ): string | undefined {
    if (color === 'initial' || color === 'inherit') return undefined;
    return colord(color).alpha(this.ref.emphasis[emphasis]).toHex();
  }

  alpha(key: OpacityEmphasis): number {
    return this.ref.emphasis[key];
  }
}
