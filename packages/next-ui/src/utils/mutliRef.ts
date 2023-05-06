import { ForwardedRef, MutableRefObject } from 'react';

type MultiRefData<E> = (
  | MutableRefObject<E>
  | ForwardedRef<E>
  | undefined
  | null
)[];

export function updateRef<E>(element: E, references: MultiRefData<E>) {
  references
    .filter((ref) => ref != null)
    .forEach((ref) => {
      if (typeof ref !== 'function') ref.current = element;
      else (ref as Function)(element);
    });
}

export function multiRef<E>(...references: MultiRefData<E>) {
  return (element: E) => updateRef(element, references);
}
