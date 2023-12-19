import {
  MediaGroupModel,
  MediaItemType,
  ProcessedMediaItemModel,
} from '@/modules/media/media';
import { desktopMediaQuery } from '@/utils/device';
import { InfiniteItemEvents } from '@/utils/pages/infinite/infiniteItem';
import { CSSObject, useTheme } from '@emotion/react';
import { propMerge, Skeleton, UI } from 'next-ui';
import Image from 'next/image';
import { HTMLAttributes, ReactElement, useMemo, useState } from 'react';

/** @jsxImportSource @emotion/react */
export type MediaItemProps = {
  group: MediaGroupModel;
  item: ProcessedMediaItemModel;
} & HTMLAttributes<HTMLDivElement> &
  InfiniteItemEvents<ProcessedMediaItemModel>;

const typeElementMap = {
  VIDEO: (props) => <MediaVideo {...props} />,
  AUDIO: (props) => <MediaAudio {...props} />,
  IMAGE: (props) => <MediaImage {...props} />,
} as const satisfies Record<MediaItemType, (x: MediaItemProps) => ReactElement>;

export default function MediaItem(props: MediaItemProps) {
  return typeElementMap[props.item.type](props);
}

function MediaImage(props: MediaItemProps) {
  const { group, item, onDelete, onEdit, ...rest } = props;
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
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 1,
            position: 'relative',
            width: '100%',
            minWidth: 250,
            [desktopMediaQuery(theme)]: { maxWidth: 400 },
            height: 400,
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

const videoDim = { width: 378, height: 212 } as const;

function MediaVideo(props: MediaItemProps) {
  const { item } = props;
  const urlObj = useMemo(() => {
    return new URL(item.publicURL);
  }, [item.publicURL]);
  return /* isYoutubeVideo */ useMemo(() => {
    return urlObj.hostname.match(/.*(\.)?(youtube|yt)\..*/);
  }, [urlObj]) ? (
    <YoutubeVideo {...props} />
  ) : (
    <video width={videoDim.width} height={videoDim.height} controls>
      <source src={item.publicURL} type={item.mimetype} />
      Dein Browser unterstützt eingebundene Videos nicht.
    </video>
  );
}

function YoutubeVideo({ item }: MediaItemProps) {
  const url = useMemo(() => {
    const { pathname, searchParams, origin } = new URL(item.publicURL!);
    if (pathname === '/watch' && searchParams.has('v'))
      return `https://www.youtube.com/embed/${searchParams.get('v')}`;
    return origin;
  }, [item.publicURL]);
  return (
    <div style={{ position: 'relative' }}>
      <Skeleton width={videoDim.width} height={videoDim.height} />
      <iframe
        width={videoDim.width}
        height={videoDim.height}
        src={url}
        allowFullScreen
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
}

function MediaAudio({ group, item }: MediaItemProps) {
  return null;
}
