import { RefObject, useEffect, useMemo } from 'react';

type _AttribValue = string | undefined;

type _MapValue = _AttribValue | [initial: _AttribValue, value: _AttribValue];

// prettier-ignore

export function useAttributes<
  TElement extends Element,
  TAttribs extends string,
>(map: Record<TAttribs, _MapValue>, target: RefObject<TElement> | undefined |null) {
  // prettier-ignore
  const entries = useMemo(() => Object.entries(map), [map]);
  useEffect(() => {
    if (!target?.current) return;
    const modified = target.current;
    entries.forEach(([attrib, input]) => {
      const value = Array.isArray(input) ? input[1] : input;
      if (value === undefined) modified.removeAttribute(attrib);
      else modified.setAttribute(attrib, value);
    });
    return () => {
      entries.forEach(([attrib, input]) => {
        const initial = Array.isArray(input) ? input[0] : undefined;
        if (initial === undefined) modified.removeAttribute(attrib);
        else modified.setAttribute(attrib, initial);
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, ...entries.flat()]);
}
