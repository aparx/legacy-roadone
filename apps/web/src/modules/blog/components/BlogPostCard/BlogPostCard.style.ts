import { css, Theme } from '@emotion/react';
import { UI } from 'next-ui';

export const commentSection = (theme: Theme) => {
  const { rt, sys } = theme;
  return css({
    backgroundColor: sys.color.surface[2],
    padding: rt.multipliers.spacing('md'),
    borderBottomLeftRadius: rt.multipliers.roundness(UI.generalRoundness),
    borderBottomRightRadius: rt.multipliers.roundness(UI.generalRoundness),
  });
};
