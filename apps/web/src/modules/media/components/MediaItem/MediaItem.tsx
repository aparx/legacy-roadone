import { MediaItemConfig as config } from './MediaItem.config';
import { Permission } from '@/modules/auth/utils/permission';
import {
  MediaGroupModel,
  MediaItemType,
  ProcessedMediaItemModel,
} from '@/modules/media/media';
import { desktopMediaQuery, useIsMobile } from '@/utils/device';
import { InfiniteItemEvents } from '@/utils/pages/infinite/infiniteItem';
import { CSSObject, useTheme } from '@emotion/react';
import { Button, propMerge, RequiredChildren, Skeleton, UI } from 'next-ui';
import Image from 'next/image';
import {
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  useMemo,
  useState,
} from 'react';
import { MdDeleteForever } from 'react-icons/md';

import useGlobalPermission = Permission.useGlobalPermission;

/** @jsxImportSource @emotion/react */
export type MediaItemProps = {
  group: MediaGroupModel;
  item: ProcessedMediaItemModel;
} & HTMLAttributes<HTMLDivElement> &
  InfiniteItemEvents<ProcessedMediaItemModel, 'delete'>;

const typeElementMap = {
  VIDEO: (props) => <MediaVideo {...props} />,
  AUDIO: (props) => <MediaAudio {...props} />,
  IMAGE: (props) => <MediaImage {...props} />,
} as const satisfies Record<MediaItemType, (x: MediaItemProps) => ReactElement>;

export function MediaItemContainer({
  children,
}: {
  children: RequiredChildren;
}) {
  const isMobile = useIsMobile();
  let theme = useTheme();
  return (
    <div
      css={{
        flex: '1 1 auto',
        maxWidth: '100%',
        minWidth: 250,
        [desktopMediaQuery(theme)]: { maxWidth: 400 },
        position: 'relative',
        ':not(:hover) > button': !isMobile && {
          visibility: 'hidden',
        },
      }}
    >
      {children}
    </div>
  );
}

export default function MediaItem(props: MediaItemProps) {
  const { onDelete } = props;
  return (
    <MediaItemContainer>
      {typeElementMap[props.item.type](props)}
      {useGlobalPermission('media.upload') && (
        <Button.Surface
          style={{
            top: 0,
            left: 0,
            position: 'absolute',
            background: 'transparent',
          }}
          icon={<MdDeleteForever size={18} />}
          onClick={() => onDelete({ item: props.item })}
          tight
        />
      )}
    </MediaItemContainer>
  );
}

function MediaImage(props: MediaItemProps) {
  const { group, item, onDelete, ...rest } = props;
  const [imageLoaded, setImageLoaded] = useState(false);
  const theme = useTheme();
  return (
    <a
      href={item.publicURL}
      id={item.id}
      data-item-type={item.type}
      {...propMerge(
        {
          css: {
            display: 'block',
            borderRadius: theme.rt.multipliers.roundness(UI.generalRoundness),
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            height: config.heightPerItem['IMAGE'],
            cursor: imageLoaded ? 'pointer' : undefined,
          } satisfies CSSObject,
        },
        rest
      )}
    >
      {!imageLoaded && <Skeleton style={{ width: '100%', height: '100%' }} />}
      <Image
        src={item.publicURL}
        alt={item.name}
        onLoad={() => setImageLoaded(true)}
        fill
        style={{
          visibility: !imageLoaded ? 'hidden' : 'visible',
          objectFit: 'cover',
          objectPosition: 'center',
          border: 0,
          outline: 'none',
        }}
      />
    </a>
  );
}

function MediaVideo(props: MediaItemProps) {
  const { item } = props;
  const urlObj = useMemo(() => {
    return new URL(item.publicURL);
  }, [item.publicURL]);
  const style = {
    position: 'relative',
    maxWidth: 400,
    minWidth: 300,
    height: config.heightPerItem['VIDEO'],
    flex: '1 1 auto',
  } satisfies CSSProperties;

  return /* isYoutubeVideo */ useMemo(() => {
    return urlObj.hostname.match(/.*(\.)?(youtube|yt)\..*/);
  }, [urlObj]) ? (
    <YoutubeVideo {...props} style={style} />
  ) : (
    <video style={style} controls>
      <source src={item.publicURL} type={item.mimetype} />
      Dein Browser unterstützt eingebundene Videos nicht.
    </video>
  );
}

function YoutubeVideo({ item, ...props }: MediaItemProps) {
  const url = useMemo(() => {
    const { pathname, searchParams, origin } = new URL(item.publicURL!);
    if (pathname === '/watch' && searchParams.has('v'))
      return `https://www.youtube.com/embed/${searchParams.get('v')}`;
    return origin;
  }, [item.publicURL]);
  return (
    <div {...props}>
      <Skeleton style={{ width: '100%', height: '100%' }} />
      <iframe
        src={url}
        allowFullScreen
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

function MediaAudio({}: MediaItemProps) {
  return null;
}
