import type { StackCenter, StackData } from './Stack';
import { css, Theme } from '@emotion/react';
import type { CSSProperties } from 'react';
import type { UnionPick } from 'shared-utils';

type CenterProperty = UnionPick<
  keyof CSSProperties,
  'alignItems' | 'justifyContent'
>;

const hCenterPropertyMap = {
  row: 'justifyContent',
  'row-reverse': 'justifyContent',
  column: 'alignItems',
  'column-reverse': 'alignItems',
} satisfies Record<StackData['direction'], CenterProperty>;

export const stack = (theme: Theme, data: Omit<StackData, 'spacing'>) => {
  const [hProp, vProp] = getCenterProps(data.direction);
  const [hCenter, vCenter] = getCenterValue(data.hAlign, data.vAlign);
  return css({
    display: 'flex',
    flexDirection: data.direction,
    [hProp]: hCenter || 'initial',
    [vProp]: vCenter || 'initial',
  });
};

function getCenterProps(
  direction: StackData['direction']
): [horizontal: CenterProperty, vertical: CenterProperty] {
  const h = hCenterPropertyMap[direction];
  return [h, h === 'justifyContent' ? 'alignItems' : 'justifyContent'];
}

function getCenterValue(left: StackCenter, right: StackCenter) {
  return [left === true ? 'center' : left, right === true ? 'center' : right];
}
