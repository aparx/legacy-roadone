import {
  DynamicMultiplierName,
  DynamicMultiplierSection,
} from '../../reference';

export type RuntimeNamedMultiplierMap = Record<
  DynamicMultiplierName,
  Record<string, number>
>;

/** Every number of one type is multiplied by whatever factor is given. */
export type NamedMultiplierMap = Record<
  DynamicMultiplierName,
  Record<string, number>
>;

export type MultiplierOperationInput<
  TType extends DynamicMultiplierName,
  TMap extends NamedMultiplierMap
> = keyof TMap[TType] | number;

export class RuntimeMultipliers<TMap extends NamedMultiplierMap> {
  constructor(
    readonly themeMultipliers: DynamicMultiplierSection,
    readonly nameInputMap: TMap
  ) {}

  spacing(input: MultiplierOperationInput<'spacing', TMap>) {
    return this.multiply('spacing', input);
  }

  roundness(input: MultiplierOperationInput<'roundness', TMap>) {
    return this.multiply('roundness', input);
  }

  multiply<TType extends DynamicMultiplierName>(
    type: TType,
    input: MultiplierOperationInput<TType, TMap>
  ) {
    if (type == null || input == null) return undefined;
    return this.getMultiplier(type, input) * this.themeMultipliers[type];
  }

  getMultiplier<TType extends DynamicMultiplierName>(
    type: TType,
    input: MultiplierOperationInput<TType, TMap>
  ): number {
    return typeof input === 'number' ? input : this.nameInputMap[type][input];
  }
}
