import { create } from "zustand";

interface ChatState {
  channelId: string;
  userId: number | null;
  messages: { user: string; content: string }[];
  setChannelId: (channelId: string) => void;
  setUserId: (userId: number) => void;
  setMessages: (messages: { user: string; content: string }[]) => void;
  addMessage: (message: { user: string; content: string }) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  channelId: "default-channel",
  userId: null,
  messages: [],

  setChannelId: (channelId) => set({ channelId }),
  setUserId: (userId) => set({ userId }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));

