import { CSSObject } from '@emotion/react';
import { merge } from 'lodash';

type SpecialPropMutator<TProps = any> = (...props: TProps[]) => any;

const specialRootHandlers: Record<string, SpecialPropMutator> = {
  className: (...props: (string | string[])[]) => styleClassMerge(...props),
  css: (...props: (CSSObject | CSSObject[])[]) => props.flatMap((css) => css),
} satisfies Record<string, SpecialPropMutator>;

export function propMerge<TPropObjs extends any[]>(...propObjs: TPropObjs) {
  const merged = merge({}, ...propObjs);
  for (const key in specialRootHandlers) {
    // (I)  collect all props within propsObjs with `key`
    const props = propObjs.filter((o) => o && key in o).map((o) => o[key]);
    // (II) call special handler with all those collected props
    if (props.length !== 0) merged[key] = specialRootHandlers[key](...props);
  }
  return merged;
}

export function styleClassMerge(...classData: (string | string[])[]): string {
  return joinStyleClasses(flatStyleClasses(...classData));
}

export function joinStyleClasses(classData: string[]): string {
  return classData.join(' ');
}

export function flatStyleClasses(...classData: (string | string[])[]) {
  return classData.map((data) => _flatStyleClass(data)).flat();
}

function _flatStyleClass(classData: string | string[]): string[] {
  if (!Array.isArray(classData))
    return classData.split(' ').filter((s) => s.length !== 0);
  const outputArray: string[] = [];
  for (const name of classData) {
    if (name.length === 0) continue;
    if (name.indexOf(' ') !== -1) {
      outputArray.push(..._flatStyleClass(name));
    } else outputArray.push(name);
  }
  return outputArray;
}
