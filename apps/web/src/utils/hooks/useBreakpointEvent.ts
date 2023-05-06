import { useInitialEffect } from '@/utils/hooks/useInitialEffect';
import {
  getWindowDimension,
  WindowDimension,
} from '@/utils/hooks/useWindowDimension';
import { useTheme } from '@emotion/react';
import { useIsomorphicEvent } from 'next-ui';
import { useCallback, useEffect, useRef } from 'react';
import type { BreakpointName } from 'theme-core';
import { dynamicBreakpoints, RuntimeBreakpoints } from 'theme-core';

type BreakpointChangeData = {
  point: BreakpointName;
  dimension: WindowDimension;
  position: number;
  gte(other: BreakpointName): boolean;
  lte(other: BreakpointName): boolean;
};

type BreakpointChangeDataConstructor = {
  (point: BreakpointName, dimension: WindowDimension): BreakpointChangeData;
  new (point: BreakpointName, dimension: WindowDimension): BreakpointChangeData;
};

const BreakpointChangeData = function (point, dimension) {
  return {
    point,
    dimension,
    position: index(point),
    gte(other: BreakpointName): boolean {
      return this.position >= index(other);
    },
    lte(other: BreakpointName): boolean {
      return this.position <= index(other);
    },
  };
} as BreakpointChangeDataConstructor;

export type BreakpointState = {
  from: BreakpointChangeData | undefined;
  to: BreakpointChangeData;
};

export type BreakpointEventListener = (state: BreakpointState) => any;

export function useBreakpointEvent(
  listener?: BreakpointEventListener,
  initial?: BreakpointState
) {
  const { breakpoints } = useTheme().rt;
  const state = useRef(initial);
  const callback = useRef(listener);
  // prettier-ignore
  useEffect(() => { callback.current = listener; });
  const onUpdate = useCallback(() => {
    const dimension = getWindowDimension(window);
    const point = getBreakpointOfDimension(breakpoints, dimension);
    if (state.current?.to?.point !== point) {
      const newValue: BreakpointState = {
        from: state.current?.to,
        to: new BreakpointChangeData(point, dimension),
      };
      callback.current?.(newValue);
      state.current = newValue;
    }
  }, [breakpoints]);
  useInitialEffect(onUpdate); // immediate update on initial on-mount
  useIsomorphicEvent('resize', onUpdate, 'window');
}

function index(breakpoint: BreakpointName) {
  return dynamicBreakpoints.findIndex((p) => p === breakpoint);
}

export function getBreakpointOfDimension(
  breakpoints: RuntimeBreakpoints,
  { width }: WindowDimension
): BreakpointName {
  return (
    dynamicBreakpoints.find((value: BreakpointName, index, array) => {
      const last = index - 1 >= 0 ? breakpoints.points[array[index - 1]] : -1;
      return width > last && width <= breakpoints.points[value];
    }) ?? dynamicBreakpoints[dynamicBreakpoints.length - 1]
  );
}
