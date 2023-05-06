import { useEvent, UseEventListener } from './useEvent';

type IsomorphicTarget<T extends EventTarget> = {
  type: () => 'undefined' | string;
  get: () => T;
};

type IsomorphicTargetConstructor = {
  <T extends EventTarget>(
    type: IsomorphicTarget<T>['type'],
    get: IsomorphicTarget<T>['get']
  ): IsomorphicTarget<T>;
  new <T extends EventTarget>(
    type: IsomorphicTarget<T>['type'],
    get: IsomorphicTarget<T>['get']
  ): IsomorphicTarget<T>;
};

const IsomorphicTarget = function (type, get) {
  return { type, get };
} as IsomorphicTargetConstructor;

const isomorphicTargets = {
  window: new IsomorphicTarget(
    () => typeof window,
    () => window
  ),
  document: new IsomorphicTarget(
    () => typeof document,
    () => document
  ),
} satisfies Record<string, IsomorphicTarget<any>>;

export type IsomorphicTargetName = keyof typeof isomorphicTargets;

export function useIsomorphicEvent<
  TType extends keyof GlobalEventHandlersEventMap
>(
  type: TType,
  listener: UseEventListener<TType>,
  target: EventTarget | IsomorphicTargetName,
  opts?: AddEventListenerOptions | boolean
) {
  let finalTarget: any = target;
  if (typeof finalTarget === 'string') {
    const isoTarget = isomorphicTargets[finalTarget as IsomorphicTargetName];
    finalTarget = isoTarget.type() !== 'undefined' ? isoTarget.get() : null;
  }
  return useEvent(type, listener, finalTarget, opts);
}
