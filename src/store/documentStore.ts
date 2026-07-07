import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DocumentPayload, DocumentType, HistoryItem } from "../types";
import { decryptData } from "../lib/crypto";
import { get, set, del } from "idb-keyval";
import Dexie, { type Table } from "dexie";

type DraftRow = { key: DocumentType; value: string };
type HistoryRow = { id: string; value: string };

class DepdiccDB extends Dexie {
  drafts!: Table<DraftRow, string>;
  history!: Table<HistoryRow, string>;

  constructor() {
    super("depdicc-db");
    this.version(1).stores({
      drafts: "key",
      history: "id",
    });
  }
}

const db = new DepdiccDB();

const LEGACY_KEY = "depdicc-documentos";
const MIGRATION_KEY = "depdicc-migrated";

async function isMigrated(): Promise<boolean> {
  const flag = await get(MIGRATION_KEY);
  return flag === "true";
}

async function markMigrated() {
  await set(MIGRATION_KEY, "true");
}

async function migrateLegacyData() {
  if (await isMigrated()) return;

  const raw = await get(LEGACY_KEY);
  if (!raw) {
    await markMigrated();
    return;
  }

  try {
    const decrypted = await decryptData(raw as string);
    const parsed = JSON.parse(decrypted);

    const drafts: DraftRow[] = Object.entries(parsed.drafts ?? {}).map(([key, value]) => ({
      key: key as DocumentType,
      value: JSON.stringify(value),
    }));

    const history: HistoryRow[] = (parsed.history ?? []).map((item: HistoryItem) => ({
      id: item.id,
      value: JSON.stringify(item),
    }));

    if (drafts.length) await db.drafts.bulkPut(drafts);
    if (history.length) await db.history.bulkPut(history);
  } catch {
    // If legacy data is corrupted, continue without it.
  } finally {
    await markMigrated();
    await del(LEGACY_KEY).catch(() => {});
  }
}

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
      name: LEGACY_KEY,
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          if (name !== LEGACY_KEY) return null;
          try {
            const allDrafts = await db.drafts.toArray();
            const allHistory = await db.history.toArray();

            const drafts: Partial<Record<DocumentType, DocumentPayload>> = {};
            for (const row of allDrafts) {
              drafts[row.key] = JSON.parse(row.value);
            }

            const history = allHistory.map((row) => JSON.parse(row.value) as HistoryItem);

            return JSON.stringify({ drafts, history });
          } catch {
            return null;
          }
        },
        setItem: async (name: string, value: string) => {
          if (name !== LEGACY_KEY) return;

          try {
            const parsed = JSON.parse(value);

            await db.transaction("rw", db.drafts, db.history, async () => {
              await db.drafts.clear();
              await db.history.clear();

              const drafts: DraftRow[] = Object.entries(parsed.drafts ?? {}).map(([key, val]) => ({
                key: key as DocumentType,
                value: JSON.stringify(val),
              }));

              const history: HistoryRow[] = (parsed.history ?? []).map((item: HistoryItem) => ({
                id: item.id,
                value: JSON.stringify(item),
              }));

              if (drafts.length) await db.drafts.bulkPut(drafts);
              if (history.length) await db.history.bulkPut(history);
            });
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
          if (name !== LEGACY_KEY) return;
          await db.transaction("rw", db.drafts, db.history, async () => {
            await db.drafts.clear();
            await db.history.clear();
          });
        },
      })),
      onRehydrateStorage: () => {
        migrateLegacyData();
      },
    },
  ),
);
