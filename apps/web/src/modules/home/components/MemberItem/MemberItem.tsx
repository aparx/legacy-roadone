/** @jsxImportSource @emotion/react */
import { MemberItemConfig as config } from './MemberItem.config';
import { MemberModel } from '@/modules/home/member';
import { useTheme } from '@emotion/react';
import { Skeleton, Stack, Text, useStyleableProps } from 'next-ui';
import Image from 'next/image';
import { useState } from 'react';

export type MemberCardProps = {
  member: MemberModel;
};

/**
 * Member item displaying a band-member as an `li` element.
 */
export default function MemberItem(props: MemberCardProps) {
  const { member } = props;
  const [imageLoaded, setImageLoaded] = useState(false);
  const theme = useTheme();
  return (
    <Stack
      as={'div'}
      style={{
        position: 'relative',
        width: config.width,
        height: config.height,
        borderRadius: theme.rt.multipliers.spacing('md'),
        overflow: 'hidden',
      }}
    >
      {!imageLoaded && <Skeleton style={{ width: '100%', height: '100%' }} />}
      <Image
        src={`${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${member.image}`}
        onLoad={() => setImageLoaded(true)}
        alt={'Alt'}
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
            '50% 50% at 50% 50%, rgba(37, 36, 42, 0.00) 0%, rgba(37,36, 42, .06)' +
            ' 100%), ' +
            'linear-gradient(180deg, rgba(68, 58, 142, 0.06) 0%,rgba(68, 58, 142,' +
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
        <Text.Label as={'span'} size={'lg'} aria-roledescription={'Full name'}>
          {member.firstName} {member.lastName && member.lastName}
        </Text.Label>
      </div>

      <Text.Label
        size={'md'}
        sd={{
          position: 'absolute',
          bottom: theme.rt.multipliers.spacing('md'),
          left: '50%',
          transform: 'translateX(-50%)',
          padding: 'sm',
          background: 'rgb(0,0,0,.5)',
          backdropFilter: 'blur(10px)',
          color: (t) => t.sys.color.scheme.onBackground,
          opacity: 0.9,
        }}
      >
        {member.role}
      </Text.Label>
    </Stack>
  );
}
