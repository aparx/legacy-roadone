import { Dialog } from '@/components';
import {
  dialogCancelSource,
  DialogData,
  DialogResponseSource,
} from '@/components/Dialog/Dialog';
import { create } from 'zustand';

export type DialogHandle = {
  dialog: DialogData<any> | undefined;
  close: () => void;
  show: <T extends DialogResponseSource = typeof dialogCancelSource>(
    dialog: DialogData<T>
  ) => void;
};

export const useDialogHandle = create<DialogHandle>((set) => ({
  dialog: undefined,
  close: () => set({ dialog: undefined }),
  show: <T extends DialogResponseSource>(dialog: DialogData<T>) =>
    set({ dialog: dialog }),
}));

export function DialogHandleRenderer() {
  const handle = useDialogHandle();
  if (!handle || !handle.dialog) return null;
  return <Dialog {...handle.dialog} close={handle.close} />;
}
