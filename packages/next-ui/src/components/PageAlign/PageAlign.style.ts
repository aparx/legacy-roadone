import type { BasePageAlignData } from './PageAlign';
import { createPageAlignPadding } from './PageAlign';
import { css, Theme } from '@emotion/react';

export const pageAlign = (
  { rt: { breakpoints, multipliers } }: Theme,
  { alignBy, lowerBound }: Required<BasePageAlignData>
) => {
  if (lowerBound !== 'auto')
    return css({ padding: `0 ${createPageAlignPadding(alignBy)}` });
  return css({
    /** Greater lower-bound on desktop(s) */
    [breakpoints.gte('md')]: {
      padding: `0 ${createPageAlignPadding(alignBy, multipliers.spacing(2))}`,
    },
    /** Less lower-bound on mobile(s) */
    [breakpoints.lte('md')]: {
      padding: `0 ${createPageAlignPadding(alignBy, multipliers.spacing(1))}`,
    },
  });
};
