import { ToastData } from '@/components/Toast/Toast';
import { Optional } from 'utility-types';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

export type ToastHandle = {
  /** toast-id of the current displayed toast. */
  list: ToastData[];
  add: (toast: Optional<ToastData, 'id'>) => ToastData;
  queue: (toast: ToastData) => void;
  dequeue: (id: string) => boolean;
  close: () => void;
  clear: () => void;
};

export const useToastHandle = create<ToastHandle>((set, get) => ({
  list: [],
  add: (toast) => {
    const newToast = { id: uuidv4(), ...toast };
    get().queue(newToast);
    return newToast;
  },
  queue: (toast) => set({ list: [...get().list, toast] }),
  clear: () => set({ list: [] }),
  close: () => {
    const state = get();
    if (state.list.length) state.dequeue(state.list[0].id);
  },
  dequeue: (id) => {
    const state = get();
    const newQueue = state.list.filter((e) => e.id !== id);
    set({ list: newQueue });
    return newQueue.length !== state.list.length;
  },
}));
