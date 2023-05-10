import { DialogAction, DialogResponseSource } from '@/components/Dialog/Dialog';
import { getGlobalMessage } from '@/utils/message';
import { ScrimConfig } from 'next-ui/src/components/Scrim';

export module DialogConfig {
  export const zIndex = 2 + ScrimConfig.zIndex;

  /** Action applied so the user can `cancel` a request. */
  export const dialogCancelAction = {
    id: 'cancel',
    name: getGlobalMessage('general.cancel'),
    role: 'close',
  } as const satisfies DialogAction;

  export const dialogCancelSource = [dialogCancelAction];

  /** Action applied so the user can `deny` a request. */
  export const dialogDenyAction = {
    id: 'deny',
    name: getGlobalMessage('general.deny'),
    role: 'close',
  } as const satisfies DialogAction;

  /** Dialog responses with `accept` and `deny` (deny is closing the dialog) */
  export const dialogAcceptDenySource = [
    { id: 'accept', name: getGlobalMessage('general.accept') },
    dialogDenyAction,
  ] as const satisfies DialogResponseSource;

  /** Dialog responses with `ok` and `cancel` (cancel is closing the dialog) */
  export const dialogOkCancelSource = [
    { id: 'ok', name: getGlobalMessage('general.ok') },
    dialogCancelAction,
  ] as const satisfies DialogResponseSource;

  export const dialogSaveCancelSource = [
    { id: 'save', name: getGlobalMessage('general.save'), role: 'submit' },
    dialogCancelAction,
  ] as const satisfies DialogResponseSource;

  export module Defaults {
    export const actions = dialogCancelSource;
  }
}
