export type StateColorSection = Record<SingleStateKeyUnion, string> &
  Record<MultiStateKeyUnion, MultiStateData>;

export type MultiStateKeyUnion = (typeof multiStateKeyArray)[number];

// prettier-ignore
export const multiStateKeyArray = [
  'primary', 'secondary', 'tertiary', 'surface'
] as const;

export type SingleStateKeyUnion = 'disabled';

export type MultiStateMode = 'light' | 'medium' | 'strong';

export type MultiStateData = Record<MultiStateMode, string>;
