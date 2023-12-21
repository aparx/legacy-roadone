/** @jsxImportSource @emotion/react */
import { MemberItemConfig as config } from './MemberItem.config';
import { MemberModel } from '@/modules/home/member';
import { useWindowBreakpoint } from '@/utils/context/windowBreakpoint';
import { keyframes, useTheme } from '@emotion/react';
import { Skeleton, Stack, Text, useStyleableProps } from 'next-ui';
import Image from 'next/image';
import { useMemo, useState } from 'react';

export type MemberCardProps = {
  index: number;
  member: MemberModel;
};

/**
 * Member item displaying a band-member as an `li` element.
 */
export default function MemberItem(props: MemberCardProps) {
  const { member, index } = props;
  const [imageLoaded, setImageLoaded] = useState(false);
  const theme = useTheme();
  const breakpoint = useWindowBreakpoint();

  // prettier-ignore
  const memberAnimation = useMemo(() => keyframes({
    to: { transform: 'translateY(0)', opacity: 1 }
  }), []);

  // prettier-ignore
  const roleAnimation = useMemo(() => keyframes({
    to: { transform: 'translateX(-50%) translateY(0)', opacity: .9 }
  }), []);

  /** Animation delay in milliseconds */
  const animationDelay = index * 50;

  return (
    <li
      css={{
        width: config.width,
        height: config.height,
        overflow: 'hidden',
        [theme.rt.breakpoints.lte('md')]: {
          width: '100%',
          minWidth: config.width * 0.75,
          maxWidth: config.width,
          flex: '1 1 0',
        },
      }}
    >
      <div
        css={{
          height: '100%',
          animation: `${memberAnimation} 300ms cubic-bezier(0, 0, 0.39, 0.99) forwards`,
          animationDelay: `${50 + animationDelay}ms`,
          '@media not (prefers-reduced-motion)': {
            transform: 'translateY(25px)',
            opacity: 0,
          },
        }}
      >
        <Stack
          css={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: theme.rt.multipliers.spacing('md'),
            overflow: 'hidden',
          }}
        >
          {!imageLoaded && (
            <Skeleton style={{ width: '100%', height: '100%' }} />
          )}
          <Image
            src={`${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${member.image}`}
            onLoad={() => setImageLoaded(true)}
            alt={'Alt'}
            aria-hidden
            fill
            style={{
              visibility: !imageLoaded ? 'hidden' : 'visible',
              objectFit: 'cover',
              objectPosition: 'center',
              border: 0,
              outline: 'none',
              filter: 'grayscale(100%)',
            }}
          />
          <div
            css={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background:
                'radial-gradient(' +
                '50% 50% at 50% 50%, rgba(37, 36, 42, 0.00) 0%, rgba(37,36, 42, .1)' +
                ' 100%), ' +
                'linear-gradient(180deg, rgba(68, 58, 142, 0.1) 0%,rgba(68, 58, 142,' +
                ' 0.04) 86.46%);',
            }}
          />
          <div
            {...useStyleableProps({
              position: 'absolute',
              padding: 'md',
              background: (t) => t.sys.color.scheme.tertiaryContainer,
              color: (t) => t.sys.color.scheme.onTertiaryContainer,
              backdropFilter: 'blur(10px)',
            })}
          >
            <Text.Label
              as={'span'}
              size={'lg'}
              role={'heading'}
              aria-level={6}
              aria-roledescription={'Full name'}
            >
              {member.firstName}
              {breakpoint?.to?.gte('lg') &&
                member.lastName &&
                ` ${member.lastName}`}
            </Text.Label>
          </div>

          <Text.Label
            size={'md'}
            css={{
              animation: `${roleAnimation} 250ms ease-out forwards`,
              animationDelay: `${animationDelay}ms`,
              transform: 'translateX(-50%)',
              '@media not (prefers-reduced-motion)': {
                transform: 'translateX(-50%) translateY(100%)',
                opacity: 0,
              },
            }}
            sd={{
              position: 'absolute',
              bottom: theme.rt.multipliers.spacing('md'),
              left: '50%',
              padding: 'sm',
              background: 'rgb(0,0,0,.5)',
              backdropFilter: 'blur(10px)',
              color: (t) => t.sys.color.scheme.onBackground,
            }}
          >
            {member.role}
          </Text.Label>
        </Stack>
      </div>
    </li>
  );
}
