import { DialogAction, DialogResponseSource } from '@/components/Dialog/Dialog';
import { getGlobalMessage } from '@/utils/message';
import { ScrimConfig } from 'next-ui/src/components/Scrim';

export module DialogConfig {
  export const zIndex = 2 + ScrimConfig.zIndex;

  export const dialogCancelAction = {
    id: 'cancel',
    name: getGlobalMessage('general.cancel'),
    doClose: true,
  } as const satisfies DialogAction;

  export const dialogCancelSource = [dialogCancelAction];

  /** Dialog responses with `accept` and `deny` (deny is closing the dialog) */
  export const dialogAcceptDenySource = [
    { id: 'accept', name: getGlobalMessage('general.accept') },
    { id: 'deny', name: getGlobalMessage('general.deny'), doClose: true },
  ] as const satisfies DialogResponseSource;

  /** Dialog responses with `ok` and `cancel` (cancel is closing the dialog) */
  export const dialogOkCancelSource = [
    { id: 'ok', name: getGlobalMessage('general.ok') },
    dialogCancelAction,
  ] as const satisfies DialogResponseSource;

  export module Defaults {
    export const actions = dialogCancelSource;
  }
}
