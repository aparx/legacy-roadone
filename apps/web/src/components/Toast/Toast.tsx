/** @jsxImportSource @emotion/react */
import { ToastConfig as config } from './Toast.config';
import * as style from './Toast.style';
import { useTheme } from '@emotion/react';
import { capitalize } from 'lodash';
import {
  Icon,
  propMerge,
  PropsWithStyleable,
  Stack,
  Text,
  useAwareTimeout,
  useStyleableMerge,
} from 'next-ui';
import { forwardRef, ReactElement, ReactNode } from 'react';
import { IconBaseProps } from 'react-icons';
import { MdCheck, MdError, MdInfo, MdWarning } from 'react-icons/md';
import { WithArray } from 'shared-utils';
import type { SchemeContainerColorInput } from 'theme-core';

export type ToastType = (typeof toastTypeArray)[number];

export const toastTypeArray = ['success', 'error', 'warning', 'info'] as const;

/** Map of named times for toasts in seconds. */
export const toastDurationMap = {
  long: 12,
  normal: 6,
  short: 4,
} satisfies Record<string, number>;

export type ToastData = {
  id: string;
  type: ToastType;
  title?: string;
  message?: WithArray<ReactNode>;
  /** Time-alive for this toast in seconds.
   * @default 'normal' */
  duration?: number | keyof typeof toastDurationMap;
};

export type ToastProps = PropsWithStyleable<ToastData> & {
  /** Event method called whenever the toast finishes. */
  onFinish: () => any;
};

const toastColorMap = {
  success: 'primary',
  error: 'error',
  info: 'secondary',
  warning: 'tertiary',
} as const satisfies Record<ToastType, SchemeContainerColorInput>;

export const toastIconMap = {
  success: () => <MdCheck />,
  error: () => <MdError />,
  warning: () => <MdWarning />,
  info: () => <MdInfo />,
} as const satisfies Record<ToastType, () => ReactElement<IconBaseProps>>;

export const Toast = forwardRef<HTMLOutputElement, ToastProps>(
  function SoloToastRenderer(
    {
      type,
      title,
      message,
      id,
      duration = config.defaults.duration,
      onFinish,
      ...rest
    },
    ref
  ) {
    duration =
      typeof duration === 'string' ? toastDurationMap[duration] : duration;
    useAwareTimeout(() => {
      onFinish();
    }, duration * 1000);
    const t = useTheme();
    const base = toastColorMap[type];
    return (
      <Stack
        direction={'row'}
        spacing={'lg'}
        ref={ref}
        {...propMerge(
          {
            css: style.toast(t, {
              duration,
              background: t.sys.color.scheme[`${base}Container`],
              foreground: t.sys.color.scheme[`on${capitalize(base)}Container`],
            }),
          },
          useStyleableMerge(rest)
        )}
      >
        <Icon key={'leading'} icon={toastIconMap[type]()} />
        <Stack spacing={0}>
          {title && (
            <Text.Title as={'div'} size={'md'}>
              {title}
            </Text.Title>
          )}
          {message && (
            <Text.Body size={'md'} take={{ fontWeight: 'medium' }}>
              <>{message}</>
            </Text.Body>
          )}
        </Stack>
      </Stack>
    );
  }
);

export default Toast;
