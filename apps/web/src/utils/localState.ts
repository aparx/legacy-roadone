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

export type LocalToggle = LocalState<boolean> & { toggle: () => void };

export function useLocalToggle(initial?: boolean): LocalToggle {
  const s = useLocalState(initial ?? false);
  return useMemo(() => ({ ...s, toggle: () => s.set((b) => !b) }), [s]);
}
