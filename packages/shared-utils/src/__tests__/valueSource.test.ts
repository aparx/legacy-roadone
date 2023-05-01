import { resolveSource as _resolve, ValueSource } from '../valueSource';

describe('resolveValueSource', () => {
  test('correct return value', () => {
    expect(_resolve<ValueSource<string>>('hello')).toBe('hello');
    expect(_resolve<ValueSource<string>>(() => 'hello')).toBe('hello');
    expect(_resolve<ValueSource<() => string>>(() => () => 'a')()).toBe('a');
  });

  test('correct argument passing (I)', () => {
    expect(_resolve<ValueSource<number, [number]>>((n) => n, 3)).toBe(3);
    expect(_resolve<ValueSource<number, [number]>>((n) => 2 * n, 1)).toBe(2);
  });

  test('correct argument passing (II)', () => {
    expect(
      _resolve<ValueSource<number, [number, number]>>((n1, n2) => n1 * n2, 2, 2)
    ).toBe(4);
    expect(
      _resolve<ValueSource<number, [number, number, number]>>(
        (n1, n2, n3) => n1 + n2 + n3,
        1,
        2,
        3
      )
    ).toBe(6);
  });
});
