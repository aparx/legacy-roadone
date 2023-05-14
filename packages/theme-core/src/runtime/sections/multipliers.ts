import { MultiplierName, MultiplierSection } from '../../reference';

export type RuntimeNamedMultiplierMap = Record<
  MultiplierName,
  Record<string, number>
>;

/** Every number of one type is multiplied by whatever factor is given. */
export type NamedMultiplierMap = Record<MultiplierName, Record<string, number>>;

export type MultiplierOperationInput<
  TType extends MultiplierName,
  TMap extends NamedMultiplierMap
> = keyof TMap[TType] | number;

export class RuntimeMultipliers<TMap extends NamedMultiplierMap> {
  constructor(
    readonly themeMultipliers: MultiplierSection,
    readonly nameInputMap: TMap
  ) {}

  spacing(input: MultiplierOperationInput<'spacing', TMap>) {
    return this.multiply('spacing', input);
  }

  roundness(input: MultiplierOperationInput<'roundness', TMap>) {
    return this.multiply('roundness', input);
  }

  spacingInverse(output: number) {
    return this.convert('spacing', output);
  }

  roundnessInverse(output: number) {
    return this.convert('roundness', output);
  }

  multiply<TType extends MultiplierName>(
    type: TType,
    input: MultiplierOperationInput<TType, TMap>
  ) {
    if (type == null || input == null) return undefined;
    return this.numberizeInput(type, input) * this.getMultiplier(type);
  }

  /**
   * Converts `output`, such that the returning value multiplied by the multiplier of
   * `type` is equal to `output`.
   * Note that the accuracy might not be fully correct, due to floating point
   * precision, which is why it is rounded to 5 decimals.
   *
   * @param type the target type
   * @param output the target product
   * @param input (optional)
   */
  convert<TType extends MultiplierName>(type: TType, output: number) {
    return Number((output / this.getMultiplier(type)).toFixed(5));
  }

  numberizeInput<TType extends MultiplierName>(
    type: TType,
    input: MultiplierOperationInput<TType, TMap>
  ): number {
    return typeof input === 'number' ? input : this.nameInputMap[type][input];
  }

  getMultiplier<TType extends MultiplierName>(type: TType) {
    return this.themeMultipliers[type];
  }
}
