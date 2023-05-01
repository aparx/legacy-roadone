import { RuntimeTheme, Theme } from '../theme';
import {
  NamedMultiplierMap,
  RuntimeBreakpoints,
  RuntimeMultipliers,
} from './sections';

export * from './sections';

export interface RuntimeSection<TMultiplierNameMap extends NamedMultiplierMap> {
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
