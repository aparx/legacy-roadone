import { resolveSource, ValueSource } from './valueSource';

export function memoize<TValue>(value: ValueSource<TValue>) {
  let _captured = false;
  let _value: TValue | undefined;
  return function (): TValue {
    if (_captured) return _value as TValue;
    _value = resolveSource<ValueSource<any>>(value) as TValue;
    _captured = true;
    return _value;
  };
}
