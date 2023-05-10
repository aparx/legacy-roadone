import { Dialog } from '@/components';
import { DialogData } from '@/components/Dialog/Dialog';
import { create } from 'zustand';

export type DialogHandle = {
  dialog: DialogData | undefined;
  close: () => void;
  show: (dialog: DialogData) => void;
};

export const useDialogHandle = create<DialogHandle>((set) => ({
  dialog: undefined,
  close: () => set({ dialog: undefined }),
  show: (dialog: DialogData) => set({ dialog: dialog }),
}));

export function DialogHandleRenderer() {
  const handle = useDialogHandle();
  if (!handle || !handle.dialog) return null;
  return <Dialog {...handle.dialog} close={handle.close} />;
}
