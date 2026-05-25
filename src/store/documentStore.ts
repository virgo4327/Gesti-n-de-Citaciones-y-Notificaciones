import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DocumentPayload, DocumentType, HistoryItem } from "../types";
import { encryptData, decryptData } from "../lib/crypto";

type Store = {
  drafts: Partial<Record<DocumentType, DocumentPayload>>;
  history: HistoryItem[];
  saveDraft: (type: DocumentType, payload: DocumentPayload) => void;
  addHistory: (type: DocumentType, payload: DocumentPayload) => HistoryItem;
  deleteHistory: (id: string) => void;
  clearDraft: (type: DocumentType) => void;
};

export const useDocumentStore = create<Store>()(
  persist(
    (set) => ({
      drafts: {},
      history: [],
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
    }),
    {
      name: "depdicc-documentos",
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          try {
            return await decryptData(raw);
          } catch {
            return raw;
          }
        },
        setItem: async (name: string, value: string) => {
          const encrypted = await encryptData(value);
          localStorage.setItem(name, encrypted);
        },
        removeItem: async (name: string) => {
          localStorage.removeItem(name);
        },
      })),
    },
  ),
);
