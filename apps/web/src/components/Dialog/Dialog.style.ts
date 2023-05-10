import { DialogConfig as config } from './Dialog.config';
import { css } from '@emotion/react';

export const wrapper = css({
  position: 'fixed',
  inset: 0,
  zIndex: config.zIndex,
});

export const dialog = css({
  padding: 20,
});
