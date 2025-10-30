import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface NotificationsState {
  unreadCount: number;
  incrementUnreadCount: () => void;
  setUnreadCount: (count: number) => void;
  resetUnreadCount: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  devtools(
    (set) => ({
      unreadCount: 0,
      incrementUnreadCount: () =>
        set((state) => ({ unreadCount: state.unreadCount + 1 })),
      setUnreadCount: (count: number) =>
        set({ unreadCount: count }),
      resetUnreadCount: () =>
        set({ unreadCount: 0 }),
    }),
    { name: 'notifications-store' }
  )
);