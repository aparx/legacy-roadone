import { css, Theme } from '@emotion/react';

/** Style used for (nested) replies, not top-level comments */
export const deepWrapper = (theme: Theme) =>
  css({
    borderLeft: `solid ${theme.sys.color.scheme.surfaceVariant} 1px`,
    paddingLeft: theme.rt.multipliers.spacing('md'),
  });

export const list = (theme: Theme) => {
  const { rt } = theme;
  return css({
    padding: rt.multipliers.spacing('md'),
  });
};
