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
export type MessagePath<TMap extends PlainMessageMap> =
  _MessagePathBuilder<TMap, keyof TMap>;

type MESSAGE_ERROR = 'NOT_FOUND' | 'END_OF_ROAD' | 'EMPTY';

export type MessageProvider = {
  error: (code: MESSAGE_ERROR, trace: string | string[]) => string | never;
  messages: PlainMessageMap;
};

type _MappingFromProvider<T extends MessageProvider> = T['messages'];

export function resolveMessage<TProvider extends MessageProvider>(
  source: TProvider,
  path: MessagePath<_MappingFromProvider<TProvider>>
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
    translation: {
      warning: 'Warnung',
      success: 'Erfolg',
      info: 'Info',
      error: 'Fehler',
      title: 'Titel',
      city: 'Stadt',
      street: 'Straße',
      postcode: 'Postleitzahl',
      description: 'Beschreibung',
    },
    app: {
      name: 'roadone',
    },
    general: {
      load_more: 'Mehr laden',
      profile_picture: 'Profilbild',
      add: '%s hinzufügen',
      accept: 'Annehmen',
      deny: 'Ablehnen',
      ok: 'Ok',
      save: 'Speichern',
      cancel: 'Abbrechen',
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
        name: 'Auftritt',
        card: 'Auftritt am %s',
        group: 'Auftritte in %s',
      },
    },
    gig: {
      start: 'Beginn',
    },
    responses: {
      gig: {
        title: {
          duplicate: 'Den Titel gibt es bereits',
        },
      },
    },
  },
} as const satisfies MessageProvider;

export type GlobalMessageMap = _MappingFromProvider<
  typeof globalMessageProvider
>;

/**
 * Returns the raw global message at given `path`.
 * In order to apply formatting, use the `useMessage`-hook instead.
 */
export const getGlobalMessage = (path: MessagePath<GlobalMessageMap>) =>
  resolveMessage(globalMessageProvider, path);
