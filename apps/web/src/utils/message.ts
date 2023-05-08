type PlainMessageMap = Record<string, string | object>;

const del = '.';
type PathDelimiter = typeof del;

type _PathConcatenate<
  TLeading extends string | undefined,
  TKey extends string
> = TLeading extends undefined ? TKey : `${TLeading}${PathDelimiter}${TKey}`;

type _MessagePathBuilder<
  TObject extends PlainMessageMap,
  TKey extends keyof TObject,
  _TPrevK extends string | undefined = undefined,
  _TPrevO extends PlainMessageMap | undefined = undefined,
  _TBuilt extends string | undefined = undefined
> = TKey extends string
  ? TObject[TKey] extends PlainMessageMap
    ? _MessagePathBuilder<
        TObject[TKey],
        keyof TObject[TKey],
        TKey,
        TObject,
        _TBuilt extends undefined
          ? _TPrevK extends undefined
            ? undefined
            : `${_TPrevK}`
          : _TBuilt
      >
    : _PathConcatenate<_TBuilt, _PathConcatenate<_TPrevK, TKey>>
  : never;

// prettier-ignore
export type MessagePathUnion<TMap extends PlainMessageMap> =
  _MessagePathBuilder<TMap, keyof TMap>;

type MESSAGE_ERROR = 'NOT_FOUND' | 'END_OF_ROAD' | 'EMPTY';

export type MessageProvider = {
  error: (code: MESSAGE_ERROR, trace: string | string[]) => string | never;
  messages: PlainMessageMap;
};

type _MappingFromProvider<T extends MessageProvider> = T['messages'];

export function resolveMessage<TProvider extends MessageProvider>(
  source: TProvider,
  path: MessagePathUnion<_MappingFromProvider<TProvider>>
): string {
  if (del.length === 0) return source.error('EMPTY', []);
  const segArray = (path as string).split(del);
  let tail: string | object = source.messages;
  for (let i = 0; i < segArray.length; ++i) {
    const seg = segArray[i];
    if (typeof tail !== 'object')
      return source.error('END_OF_ROAD', segArray.splice(0, 1 + i).join(del));
    else if (!(seg in tail))
      return source.error('NOT_FOUND', segArray.splice(0, 1 + i).join(del));
    tail = tail[seg];
  }
  if (typeof tail === 'string') return tail;
  return source.error('END_OF_ROAD', path);
}

// <===============================>
//    APP-GLOBAL MESSAGE MAPPINGS
// <===============================>

export const globalMessageProvider = {
  error: (c, t) => `[MESSAGE_${c}: ${t}]`,
  messages: {
    app: {
      name: 'roadone',
    },
    general: {
      load_more: 'Mehr laden',
    },
    auth: {
      signIn: 'Einloggen',
    },
    aria: {
      navigation: {
        close: 'Navigation schließen',
        open: 'Navigation öffnen',
      },
      gig: {
        card: 'Auftritt am %s',
        group: 'Auftritte in %s',
      },
    },
  },
} as const satisfies MessageProvider;

/**
 * Returns the raw global message at given `path`.
 * In order to apply formatting, use the `useMessage`-hook instead.
 */
export const getGlobalMessage = (
  path: MessagePathUnion<_MappingFromProvider<typeof globalMessageProvider>>
) => resolveMessage(globalMessageProvider, path);
