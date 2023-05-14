import type { RuntimeTheme, Theme } from '../theme';
import {
  NamedMultiplierMap,
  RuntimeBreakpoints,
  RuntimeEmphasis,
  RuntimeMultipliers,
} from './sections';

export * from './sections';

export interface RuntimeSection<TMultiplierNameMap extends NamedMultiplierMap> {
  emphasis: RuntimeEmphasis;
  breakpoints: RuntimeBreakpoints;
  multipliers: RuntimeMultipliers<TMultiplierNameMap>;
}

export type RuntimeSectionDependencies<
  TMultiplierNameMap extends NamedMultiplierMap
> = {
  namedMultipliers: TMultiplierNameMap;
};

export function createRuntimeSection<
  TMultiplierNameMap extends NamedMultiplierMap
>(
  theme: Theme,
  dependencies: RuntimeSectionDependencies<TMultiplierNameMap>
): RuntimeSection<TMultiplierNameMap> {
  return {
    emphasis: new RuntimeEmphasis(theme.ref),
    breakpoints: new RuntimeBreakpoints(theme.ref.breakpoints),
    multipliers: new RuntimeMultipliers<TMultiplierNameMap>(
      theme.ref.multipliers,
      dependencies.namedMultipliers
    ),
  };
}

export function createRuntimeTheme<
  TMultiplierNameMap extends NamedMultiplierMap
>(
  theme: Theme,
  dependencies: RuntimeSectionDependencies<TMultiplierNameMap>
): RuntimeTheme<TMultiplierNameMap> {
  return {
    ...theme,
    rt: createRuntimeSection<TMultiplierNameMap>(theme, dependencies),
  };
}
