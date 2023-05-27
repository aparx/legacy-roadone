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
    clipboard_url_success: 'Der Link wurde in die Ablage kopiert',
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
    error: 'Oops, ein Fehler ist aufgetreten. Versuche es doch gleich erneut.',
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
      already_replied: 'Du hast hier bereits geantwortet',
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
      not_found: 'Gig konnte nicht gefunden werden (gelöscht?).',
      add_title_start_duplicate:
        'Den Titel mit gegebenem Beginn gibt es bereits!',
      add_success: 'Es kann dauern, bis der neue Auftritt angezeigt wird.',
      edit_success: 'Es kann dauern, bis die Überarbeitung angezeigt wird.',
    },
    blog: {
      not_found: 'Blog konnte nicht gefunden werden  (gelöscht?).',
      add_success: 'Es kann dauern, bis der neue Blog-Eintrag angezeigt wird.',
      edit_success: 'Es kann dauern, bis die Überarbeitung angezeigt wird.',
      reply: {
        already_replied: 'Du hast bereits in dieser Ebene kommentiert',
        add_error_disabled:
          'Die Kommentarfunktion zu diesem Blog-Eintrag wurde deaktiviert',
        add_error_notfound:
          'Der Blog-Post oder Kommentar, auf den du Antworten möchtest, wurde gelöscht.',
        error_too_many: 'Das Limit an maximalen Kommentaren wurde erreicht.',
      },
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
