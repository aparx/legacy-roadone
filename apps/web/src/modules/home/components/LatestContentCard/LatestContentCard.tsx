import * as style from './LatestContentCard.style';
import { EventModel, EventModelType } from '@/modules/event/event';
import { useTheme } from '@emotion/react';
import { Icon, Stack, Text } from 'next-ui';
import Link from 'next/link';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { IconBaseProps } from 'react-icons/lib/cjs/iconBase';
import { MdBook, MdLocalActivity, MdMusicNote } from 'react-icons/md';

const typeToIcon = {
  BLOG: (props) => <Icon icon={<MdBook {...props} />} />,
  GIG: (props) => <Icon icon={<MdLocalActivity {...props} />} />,
  SONG: (props) => <Icon icon={<MdMusicNote {...props} />} />,
} as const satisfies Record<EventModelType, (props: IconBaseProps) => any>;

export default function LatestContentCard(model: EventModel) {
  const { title, content, refId, type } = model;
  const theme = useTheme();
  return (
    <Link
      href={
        type === 'BLOG'
          ? `/blog#${refId}`
          : type === 'GIG'
          ? '/gigs'
          : '/setlist'
      }
      css={style.style}
    >
      <div style={{ position: 'absolute', inset: 0 }} />
      <Stack direction={'row'} vAlign spacing={'lg'} style={{ width: '100%' }}>
        <div>
          {typeToIcon[type]({
            size: 30,
            color: theme.sys.color.scheme.secondary,
          })}
        </div>
        <Stack
          spacing={0}
          css={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            '*': {
              whiteSpace: 'nowrap',
            },
          }}
        >
          <Stack
            vAlign
            direction={'row'}
            css={{
              [theme.rt.breakpoints.gte('xl')]: {
                justifyContent: 'left',
                flexDirection: 'row-reverse',
              },
            }}
          >
            <Text.Label
              size={'sm'}
              sd={{
                width: 'fit-content',
                height: 'fit-content',
                border: `1px solid ${theme.sys.color.scheme.primary}`,
                color: (t) => t.sys.color.scheme.primary,
                roundness: 'md',
                paddingH: 0.5,
                paddingV: 0.1,
              }}
            >
              {type}
            </Text.Label>
            <Text.Title size={'md'}>{title}</Text.Title>
          </Stack>
          <div style={{ position: 'relative' }}>
            <Text.Body size={'md'}>{content}</Text.Body>
          </div>
          <div className={'gradient'}>
            <div />
          </div>
        </Stack>
        <Icon icon={<FaExternalLinkAlt />} style={{ width: 30, height: 30 }} />
      </Stack>
    </Link>
  );
}