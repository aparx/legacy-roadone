import { LeafObjectPath, resolvePath, TraversableObject } from 'shared-utils';

export const globalMessages = {
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
    edit: 'Bearbeiten',
    delete: 'Löschen',
    content: 'Inhalt',
    share: 'Teilen',
    comments: 'Kommentare',
    replies: 'Antworten',
    send: 'Senden',
    profilePicture: 'Profilbild',
    signIn: 'Einloggen',
    signOut: 'Ausloggen',
  },
  app: {
    name: 'roadone',
  },
  general: {
    load_more: 'Mehr laden',
    profile_picture: 'Profilbild',
    add: '%s hinzufügen',
    added: '%s hinzugefügt',
    delete: '%s löschen',
    edit: '%s bearbeiten',
    accept: 'Annehmen',
    deny: 'Ablehnen',
    ok: 'Ok',
    save: 'Speichern',
    cancel: 'Abbrechen',
    error: 'Ein Fehler ist aufgetreten.',
    actionFailed: 'Aktion fehlgeschlagen!',
    actionSuccess: 'Aktion erfolgreich!',
    signInToReply: 'Einloggen um zu antworten',
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
    name: 'Auftritt',
    start: 'Beginn',
    edit: 'Auftritt bearbeiten',
  },
  blog: {
    post: {
      name: 'Blog-Eintrag',
    },
    reply: {
      name: 'Antwort',
      alternate: 'Kommentar',
      nameAddSingle: 'Antworten',
      multiShow: 'Antworten anzeigen',
      multiHide: 'Antworten ausblenden',
      dialog: {
        message_delete_zero: 'Es werden keine weiteren Antworten gelöscht.',
        message_delete_multiple:
          'Es werden alle Antworten zu diesem Kommentar gelöscht.',
      },
    },
  },
  modal: {
    sureTitle: 'Bist du sicher?',
    sureYes: 'Ja, ich bin mir sicher',
  },
  responses: {
    gig: {
      add_title_start_duplicate:
        'Den Titel mit gegebenem Beginn gibt es bereits!',
      add_success: 'Es kann dauern, bis der neue Auftritt angezeigt wird.',
      edit_success: 'Es kann dauern, bis die Überarbeitung angezeigt wird.',
    },
    blog: {
      add_success: 'Es kann dauern, bis der neue Blog-Eintrag angezeigt wird.',
      edit_success: 'Es kann dauern, bis die Überarbeitung angezeigt wird.',
    },
  },
} as const satisfies TraversableObject<string>;

export type MessagePath = LeafObjectPath<typeof globalMessages>;

/**
 * Returns the raw global message at given `path`.
 * In order to apply formatting, use the `useMessage`-hook instead.
 */
export const getGlobalMessage = (path: MessagePath, def?: string): string =>
  resolvePath({
    object: globalMessages,
    path,
    leavesOnly: true,
    delimiter: '.',
  }) ??
  def ??
  `MESSAGE_NOT_FOUND:${path}`;
