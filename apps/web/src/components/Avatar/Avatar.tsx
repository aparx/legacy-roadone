/** @jsxImportSource @emotion/react */
import { AvatarConfig as config } from './Avatar.config';
import * as style from './Avatar.style';
import { useTheme } from '@emotion/react';
import { DefaultSession } from 'next-auth';
import { propMerge, PropsWithStyleable, useStyleableMerge } from 'next-ui';
import Image from 'next/image';
import { forwardRef, HTMLAttributes } from 'react';

export type InternalAvatarProps = {
  user: DefaultSession['user'];
  name: string;
  /** @default 30 */
  size?: number;
} & HTMLAttributes<HTMLElement>;

export type AvatarProps = PropsWithStyleable<InternalAvatarProps>;

export const Avatar = forwardRef<HTMLElement, AvatarProps>(
  function AvatarRenderer(
    { user, size = config.Defaults.size, name, ...restProps },
    ref
  ) {
    const theme = useTheme();
    const styleable = useStyleableMerge(restProps);
    const props = propMerge({ css: style.avatar(theme, size) }, styleable);
    return (
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
