import type { MultiplierName } from '../../../reference';
import { RuntimeMultipliers } from '../multipliers';

describe('multipliers', () => {
  const multipliers = new RuntimeMultipliers(
    {
      spacing: 2,
      roundness: 4,
    },
    {
      spacing: {
        xl: 3,
        md: 2,
        sm: 1,
      },
      roundness: {
        full: 100,
        xl: 3,
        md: 2,
        sm: 1,
      },
    }
  );
  for (const type in multipliers.nameInputMap) {
    const _type = type as MultiplierName;
    test(`testing for type ${type}`, () => {
      for (const unit in multipliers.nameInputMap[_type]) {
        expect(multipliers.getMultiplier(_type, unit as any)).toBe(
          (multipliers.nameInputMap[_type] as any)[unit]
        );
        expect(multipliers.multiply(_type, unit as any)).toBe(
          (multipliers.nameInputMap[_type] as any)[unit] *
            multipliers.themeMultipliers[_type]
        );
      }
    });
  }
});
