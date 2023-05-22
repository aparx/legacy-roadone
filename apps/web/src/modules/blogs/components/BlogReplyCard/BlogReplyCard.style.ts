import { css, Theme } from '@emotion/react';
import { UI } from 'next-ui';

export const blogReply = (t: Theme) =>
  css({
    transition: `background ${UI.baseTransitionMs}ms`,
    '&:hover': {
      // background: t.sys.color.state.surface.light,
    },
  });

export const nestedRepliesStack = (t: Theme) =>
  css({
    borderLeft: `1px solid ${t.rt.emphasis.emphasize(
      t.sys.color.scheme.surfaceVariant,
      'low'
    )}`,
  });
