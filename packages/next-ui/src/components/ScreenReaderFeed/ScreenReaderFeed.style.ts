import { css } from '@emotion/react';

export const screenReaderFeed = css({
  position: 'absolute',
  top: 'auto',
  left: -99999,
  width: 1,
  height: 1,
  clip: 'rect(1px 1px 1px 1px)',
  clipPath: 'polygon(0px 0px, 0px 0px, 0px 0px, 0px 0px)',
  overflow: 'hidden',
});
