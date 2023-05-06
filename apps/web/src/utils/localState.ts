import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { ValueSource } from 'shared-utils';

export type LocalState<TValue> = {
  set: Dispatch<SetStateAction<TValue>>;
  state: TValue;
};

export function useLocalState<TValue>(
  initial: ValueSource<TValue>
): LocalState<TValue> {
  const [state, setState] = useState<TValue>(initial);
  return useMemo(() => ({ state, set: setState }), [state]);
}

export type ToggleState = LocalState<boolean> & { toggle: () => void };

export function useLocalToggle(initial?: boolean): ToggleState {
  const val = useLocalState(initial ?? false);
  return useMemo(() => ({ ...val, toggle: () => val.set((b) => !b) }), [val]);
}
