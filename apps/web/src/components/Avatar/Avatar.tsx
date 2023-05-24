/** @jsxImportSource @emotion/react */
import { AvatarConfig as config } from './Avatar.config';
import * as style from './Avatar.style';
import { useTheme } from '@emotion/react';
import { Session } from 'next-auth';
import { propMerge, PropsWithStyleable, useStyleableMerge } from 'next-ui';
import Image from 'next/image';
import { forwardRef, HTMLAttributes } from 'react';
import { ObjectConjunction } from 'shared-utils';

export type InternalAvatarProps = {
  user?: Session['user'] | undefined | null;
  /** @default 'Avatar' */
  name?: string;
  /** @default 30 */
  size?: number;
};

export type AvatarProps = PropsWithStyleable<
  ObjectConjunction<HTMLAttributes<HTMLElement>, InternalAvatarProps>
>;

export const Avatar = forwardRef<HTMLElement, AvatarProps>(
  function AvatarRenderer(
    {
      user,
      size = config.defaults.size,
      name = config.defaults.name,
      ...restProps
    },
    ref
  ) {
    const theme = useTheme();
    const styleable = useStyleableMerge(restProps);
    const props = propMerge({ css: style.avatar(theme, size) }, styleable);
    return (
      // TODO replace with flexShrink on the items
      <div style={{ display: 'flex' }}>
        {user?.image ? (
          <Image
            ref={ref as any}
            src={user.image}
            alt={name}
            width={size}
            height={size}
            {...props}
          />
        ) : (
          <div {...props} aria-label={name} />
        )}
      </div>
    );
  }
);

export default Avatar;
