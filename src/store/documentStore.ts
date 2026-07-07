import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DocumentPayload, DocumentType, HistoryItem } from "../types";
import { encryptData, decryptData } from "../lib/crypto";
import { get, set, del } from "idb-keyval";

type Store = {
  drafts: Partial<Record<DocumentType, DocumentPayload>>;
  history: HistoryItem[];
  storageError: string | null;
  saveDraft: (type: DocumentType, payload: DocumentPayload) => void;
  addHistory: (type: DocumentType, payload: DocumentPayload) => HistoryItem;
  deleteHistory: (id: string) => void;
  clearDraft: (type: DocumentType) => void;
  clearStorageError: () => void;
};

export const useDocumentStore = create<Store>()(
  persist(
    (set) => ({
      drafts: {},
      history: [],
      storageError: null,
      saveDraft: (type, payload) =>
        set((state) => ({ drafts: { ...state.drafts, [type]: payload } })),
      addHistory: (type, payload) => {
        const item: HistoryItem = {
          id: crypto.randomUUID(),
          type,
          numero: payload.numero,
          nombre: payload.nombre,
          generatedAt: new Date().toISOString(),
          payload,
        };
        set((state) => ({ history: [item, ...state.history] }));
        return item;
      },
      deleteHistory: (id) =>
        set((state) => ({ history: state.history.filter((item) => item.id !== id) })),
      clearDraft: (type) =>
        set((state) => {
          const drafts = { ...state.drafts };
          delete drafts[type];
          return { drafts };
        }),
      clearStorageError: () => set({ storageError: null }),
    }),
    {
      name: "depdicc-documentos",
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          try {
            const raw = await get(name);
            if (!raw) return null;
            return await decryptData(raw as string);
          } catch {
            return null;
          }
        },
        setItem: async (name: string, value: string) => {
          try {
            const encrypted = await encryptData(value);
            await set(name, encrypted);
          } catch (error) {
            const isQuota =
              error instanceof DOMException && error.name === "QuotaExceededError";
            const message = isQuota
              ? "Se superó el límite de almacenamiento. Elimine documentos del historial para continuar guardando."
              : "Error al guardar datos en el almacenamiento local.";
            throw Object.assign(new Error(message), { isQuota });
          }
        },
        removeItem: async (name: string) => {
          await del(name);
        },
      })),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.storageError = null;
      },
    },
  ),
);
