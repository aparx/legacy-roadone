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
  const s = useLocalState(initial ?? false);
  return useMemo(() => ({ ...s, toggle: () => s.set((b) => !b) }), [s]);
}
