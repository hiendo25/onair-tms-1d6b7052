import { createStore } from "zustand/vanilla";

export type SnackbarVariant = "success" | "error" | "info" | "warning";

type ToastSnackbarMessage = {
  open: boolean;
  message: string;
  variant: SnackbarVariant;
};
export interface ToastSnackbarStoreApi {
  messsages: ToastSnackbarMessage[];
  showSnackbar: (message: string, variant?: SnackbarVariant) => void;
  removeMessage: (index: number) => void;
  hideMessage: (index: number) => void;
}

const createToastSnackbarStore = () => {
  return createStore<ToastSnackbarStoreApi>()((set, get, store) => ({
    messsages: [],
    removeMessage: (index) =>
      set((prev) => {
        const newMessage = [...prev.messsages];
        newMessage.splice(index, 1);
        return {
          ...prev,
          messsages: newMessage,
        };
      }),
    hideMessage: (index) =>
      set((prev) => {
        const newMessage = [...prev.messsages];
        const messageItem = newMessage[index];
        if (messageItem) {
          newMessage.splice(index, 1, { ...messageItem, open: false });
        }
        return {
          ...prev,
          messsages: newMessage,
        };
      }),
    showSnackbar: (message, variant = "info") =>
      set((prev) => ({
        ...prev,
        messsages: [{ open: true, message, variant }],
      })),
  }));
};
export { createToastSnackbarStore };
