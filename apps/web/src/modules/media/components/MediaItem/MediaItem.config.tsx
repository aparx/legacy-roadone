import { MediaItemType } from '@/modules/media/media';

export module MediaItemConfig {
  export const heightPerItem = {
    VIDEO: 225,
    IMAGE: 400,
    AUDIO: 200,
  } as const satisfies Readonly<Record<MediaItemType, number>>;
}
