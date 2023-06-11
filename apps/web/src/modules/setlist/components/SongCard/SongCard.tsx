/** @jsxImportSource @emotion/react */
import { SongCardConfig as config } from './SongCard.config';
import { Permission } from '@/modules/auth/utils/permission';
import type { SongModel } from '@/modules/setlist/song';
import { useWindowBreakpoint } from '@/utils/context/windowBreakpoint';
import { useIsMobile } from '@/utils/device';
import { formatString } from '@/utils/format';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import { InfiniteItemEvents } from '@/utils/pages/infinite/infiniteItem';
import { useTheme } from '@emotion/react';
import {
  Button,
  Icon,
  propMerge,
  ShowIf,
  Stack,
  StyleableProp,
  Text,
  UI,
  useStyleableMerge,
} from 'next-ui';
import ScreenReaderFeed from 'next-ui/src/components/ScreenReaderFeed/ScreenReaderFeed';
import { usePinpointTextProps } from 'next-ui/src/components/Text/Text';
import { HTMLAttributes } from 'react';
import { MdDeleteForever, MdEdit, MdMusicNote } from 'react-icons/md';
import { ObjectConjunction, WithValues } from 'shared-utils';

import useGlobalPermission = Permission.useGlobalPermission;

type SongEvents = InfiniteItemEvents<SongModel, 'delete' | 'edit'>;

export type InternalSongCardProps = {
  song: SongModel;
  /** Minimum height */
  height?: number;
  /** If true showcases this song to be "fresh" (or new) */
  markNew?: boolean;
} & (
  | ({ visualOnly: true } & Partial<WithValues<SongEvents>>)
  | ({ visualOnly?: false | undefined } & SongEvents)
);

export type SongCardProps = ObjectConjunction<
  HTMLAttributes<HTMLElement>,
  InternalSongCardProps & StyleableProp
>;

export default function SongCard(props: SongCardProps) {
  const { song, height, onDelete, onEdit, markNew, visualOnly, ...restProps } =
    props;

  const canEdit = useGlobalPermission('setlist.edit');
  const canDelete = useGlobalPermission('setlist.delete');

  const showEditButton = !visualOnly && canEdit;
  const showDeleteButton = !visualOnly && canDelete;

  const isMobile = useIsMobile();
  const wpb = useWindowBreakpoint();

  const theme = useTheme();
  const { multipliers } = theme.rt;

  const isSmallScreen = canEdit || canDelete ? isMobile : wpb?.to?.lte('sm');

  const padding = 'xl';

  return (
    <Stack
      as={'article'}
      vAlign
      direction={'row'}
      hAlign={'space-between'}
      spacing={padding}
      sd={{
        padding,
        minHeight: `${
          (height ?? config.minCardHeight) -
          2 * (multipliers.spacing(padding) ?? 0)
        }px`,
        background: (t) => t.sys.color.surface[2],
        roundness: UI.generalRoundness,
        color: (t) => t.sys.color.scheme.onSurface,
      }}
      {...propMerge(
        usePinpointTextProps({ role: 'label', size: 'lg' }),
        useStyleableMerge(restProps)
      )}
    >
      <Stack
        direction={isSmallScreen ? 'column' : 'row'}
        hAlign={'space-between'}
        sd={{ width: '100%' }}
        hSpacing={'lg'}
        vSpacing={0}
        wrap
      >
        <Stack direction={'row'} vAlign spacing={'lg'}>
          <Icon icon={<MdMusicNote />} aria-hidden={true} />
          <Text.Title size={'md'}>{song.name}</Text.Title>
        </Stack>
        <ScreenReaderFeed>
          {useMessage('setlist.song_name_artist_divider')}
        </ScreenReaderFeed>
        <Stack
          direction={'row'}
          vAlign
          sd={{ emphasis: 'medium' }}
          spacing={'xl'}
        >
          <Text.Body size={'lg'}>{song.artist}</Text.Body>
        </Stack>
      </Stack>
      <ShowIf condition={markNew || showDeleteButton || showEditButton}>
        <Stack direction={'row'}>
          {markNew && (
            <Text.Label
              size={'lg'}
              aria-hidden={true}
              sd={{
                background: (t) => t.sys.color.scheme.secondaryContainer,
                color: (t) => t.sys.color.scheme.onSecondaryContainer,
                roundness: UI.generalRoundness,
                paddingV: 'sm',
                paddingH: 'md',
              }}
            >
              {getGlobalMessage('translation.new')}
            </Text.Label>
          )}
          {showEditButton && (
            <Button.Text
              tight
              icon={<MdEdit />}
              aria-label={formatString(
                getGlobalMessage('general.edit'),
                getGlobalMessage('setlist.song_name')
              )}
              onClick={() => onEdit?.({ item: song })}
            />
          )}
          {showDeleteButton && (
            <Button.Text
              tight
              icon={<MdDeleteForever />}
              aria-label={formatString(
                getGlobalMessage('general.delete'),
                getGlobalMessage('setlist.song_name')
              )}
              onClick={() => onDelete?.({ item: song })}
            />
          )}
        </Stack>
      </ShowIf>
    </Stack>
  );
}
