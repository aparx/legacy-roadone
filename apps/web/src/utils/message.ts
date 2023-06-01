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
    verified: 'Verifiziert',
    verifiedUser: 'Verifizierter Nutzer',
  },
  app: {
    name: 'roadone',
  },
  general: {
    /** Used for the link "forwarding". */
    ok_forward: 'Ok, jetzt weiterleiten',
    clipboard_url_success: 'Der Link wurde in die Ablage kopiert',
    load_more: 'Mehr laden',
    show_less: 'Weniger anzeigen',
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
    comment: {
      reply: 'Antwort',
      name: 'Kommentar',
      replyAddSingle: 'Antworten',
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
      not_found: 'Blog konnte nicht gefunden werden.',
      replies_disabled: 'Kommentare auf diesen Blog-Eintrag wurden deaktiviert',
      comment_not_found: 'Kommentar konnte nicht gefunden werden.',
      reply_limit: 'Du hast bereits zu oft unter diesem Kommentar geantwortet.',
      reply_success: 'Kommentar erfolgreich hinzugefügt.',
      total_comment_limit:
        'Dieser Blog-Eintrag hat bereits zu viele Kommentare.' +
        ' Versuch es später vielleicht noch einmal.',
    },
  },
  urlReplace: {
    dialog_title: 'Du verlässt uns',
    dialog_message_prefix: 'Du wirst zu',
    dialog_message_suffix: 'weitergeleitet',
    dialog_warning:
      'Wir wissen nicht, was sich dort befindet. Wir sind nicht' +
      ' verantwortlich für jene Inhalte. Auf eigene Gefahr.',
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
