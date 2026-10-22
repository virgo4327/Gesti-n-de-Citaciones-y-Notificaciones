import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DocumentPayload, DocumentType, HistoryItem } from "../types";
import { decryptData } from "../lib/crypto";
import { get, set, del } from "idb-keyval";
import Dexie, { type Table } from "dexie";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

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
    const state = parsed.state || parsed;

    const drafts: DraftRow[] = Object.entries(state.drafts ?? {}).map(([key, value]) => ({
      key: key as DocumentType,
      value: JSON.stringify(value),
    }));

    const history: HistoryRow[] = (state.history ?? []).map((item: HistoryItem) => ({
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

function mapRowToHistoryItem(row: any): HistoryItem {
  const p = row.payload || {};
  return {
    id: row.id,
    type: (row.tipo as DocumentType) || "a2",
    numero: row.numero || p.numero || "",
    nombre: row.nombre || p.nombre || "",
    generatedAt: row.created_at || new Date().toISOString(),
    payload: {
      ...p,
      numero: row.numero || p.numero || "",
      nombre: row.nombre || p.nombre || "",
      cf: row.carpeta_fiscal !== undefined ? row.carpeta_fiscal : p.cf || "",
      delito: row.delito !== undefined ? row.delito : p.delito || p.modalidadDelito || "",
      fechaDiligencia: row.fecha_diligencia || p.fechaDiligencia || p.fecha || "",
      horaDiligencia: row.hora_diligencia || p.horaDiligencia || p.hora || "",
      fecha: row.fecha_diligencia || p.fechaDiligencia || p.fecha || "",
      hora: row.hora_diligencia || p.horaDiligencia || p.hora || "",
      fecha2: row.fecha2 !== undefined ? row.fecha2 : p.fecha2 || "",
      hora2: row.hora2 !== undefined ? row.hora2 : p.hora2 || "",
      fecha3: row.fecha3 !== undefined ? row.fecha3 : p.fecha3 || "",
      hora3: row.hora3 !== undefined ? row.hora3 : p.hora3 || "",
    },
  };
}

function mapHistoryItemToRow(item: HistoryItem) {
  const p = (item.payload || {}) as any;
  return {
    id: item.id,
    tipo: item.type,
    numero: item.numero,
    nombre: item.nombre,
    carpeta_fiscal: p.cf || p.carpetaFiscal || "",
    delito: p.delito || p.modalidadDelito || "",
    fecha_diligencia: p.fechaDiligencia || p.fecha || "",
    hora_diligencia: p.horaDiligencia || p.hora || "",
    fecha2: p.fecha2 || "",
    hora2: p.hora2 || "",
    fecha3: p.fecha3 || "",
    hora3: p.hora3 || "",
    payload: item.payload,
    created_at: item.generatedAt,
    updated_at: new Date().toISOString(),
  };
}

type Store = {
  drafts: Partial<Record<DocumentType, DocumentPayload>>;
  history: HistoryItem[];
  storageError: string | null;
  isSyncing: boolean;
  cloudConfigured: boolean;
  saveDraft: (type: DocumentType, payload: DocumentPayload) => void;
  addHistory: (type: DocumentType, payload: DocumentPayload) => HistoryItem;
  updateHistory: (
    id: string,
    updates: {
      numero?: string;
      nombre?: string;
      fechaDiligencia?: string;
      horaDiligencia?: string;
      delito?: string;
      cf?: string;
      fecha2?: string;
      hora2?: string;
      fecha3?: string;
      hora3?: string;
    }
  ) => void;
  deleteHistory: (id: string) => void;
  clearDraft: (type: DocumentType) => void;
  clearStorageError: () => void;
  fetchFromCloud: () => Promise<void>;
  syncLocalToCloud: () => Promise<{ uploaded: number; error: string | null }>;
  initRealtimeSubscription: () => () => void;
};

export const useDocumentStore = create<Store>()(
  persist(
    (set, getStore) => ({
      drafts: {},
      history: [],
      storageError: null,
      isSyncing: false,
      cloudConfigured: isSupabaseConfigured(),

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

        // Guardar inmediatamente en estado local
        set((state) => ({ history: [item, ...state.history] }));

        // Sincronizar en segundo plano con Supabase si está configurado
        if (supabase && isSupabaseConfigured()) {
          const row = mapHistoryItemToRow(item);
          supabase
            .from("diligencias")
            .insert([row])
            .then(({ error }) => {
              if (error) {
                console.error("Error guardando diligencia en Supabase:", error);
              }
            });
        }

        return item;
      },

      updateHistory: (id, updates) => {
        let updatedItem: HistoryItem | null = null;

        set((state) => {
          const nextHistory = state.history.map((item) => {
            if (item.id !== id) return item;
            const p = (item.payload || {}) as any;
            const newNumero = updates.numero !== undefined ? updates.numero : item.numero;
            const newNombre = updates.nombre !== undefined ? updates.nombre : item.nombre;
            const newFecha =
              updates.fechaDiligencia !== undefined
                ? updates.fechaDiligencia
                : p.fechaDiligencia || p.fecha || "";
            const newHora =
              updates.horaDiligencia !== undefined
                ? updates.horaDiligencia
                : p.horaDiligencia || p.hora || "";
            const newPayload = {
              ...p,
              numero: newNumero,
              nombre: newNombre,
              cf: updates.cf !== undefined ? updates.cf : p.cf || "",
              fechaDiligencia: newFecha,
              horaDiligencia: newHora,
              fecha: newFecha,
              hora: newHora,
              fecha2: updates.fecha2 !== undefined ? updates.fecha2 : p.fecha2 || "",
              hora2: updates.hora2 !== undefined ? updates.hora2 : p.hora2 || "",
              fecha3: updates.fecha3 !== undefined ? updates.fecha3 : p.fecha3 || "",
              hora3: updates.hora3 !== undefined ? updates.hora3 : p.hora3 || "",
              delito:
                updates.delito !== undefined
                  ? updates.delito
                  : p.delito || p.modalidadDelito || "",
            };

            const mapped: HistoryItem = {
              ...item,
              numero: newNumero,
              nombre: newNombre,
              payload: newPayload,
            };
            updatedItem = mapped;
            return mapped;
          });

          return { history: nextHistory };
        });

        // Sincronizar actualización con Supabase
        if (updatedItem && supabase && isSupabaseConfigured()) {
          const row = mapHistoryItemToRow(updatedItem);
          supabase
            .from("diligencias")
            .update({
              numero: row.numero,
              nombre: row.nombre,
              carpeta_fiscal: row.carpeta_fiscal,
              delito: row.delito,
              fecha_diligencia: row.fecha_diligencia,
              hora_diligencia: row.hora_diligencia,
              fecha2: row.fecha2,
              hora2: row.hora2,
              fecha3: row.fecha3,
              hora3: row.hora3,
              payload: row.payload,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .then(({ error }) => {
              if (error) {
                console.error("Error actualizando diligencia en Supabase:", error);
              }
            });
        }
      },

      deleteHistory: (id) => {
        set((state) => ({ history: state.history.filter((item) => item.id !== id) }));

        // Sincronizar eliminación con Supabase
        if (supabase && isSupabaseConfigured()) {
          supabase
            .from("diligencias")
            .delete()
            .eq("id", id)
            .then(({ error }) => {
              if (error) {
                console.error("Error eliminando diligencia en Supabase:", error);
              }
            });
        }
      },

      clearDraft: (type) =>
        set((state) => {
          const drafts = { ...state.drafts };
          delete drafts[type];
          return { drafts };
        }),

      clearStorageError: () => set({ storageError: null }),

      fetchFromCloud: async () => {
        if (!supabase || !isSupabaseConfigured()) return;
        set({ isSyncing: true });

        try {
          const { data, error } = await supabase
            .from("diligencias")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Error al obtener datos de Supabase:", error);
            set({ storageError: `Error de nube: ${error.message}` });
            return;
          }

          if (data && Array.isArray(data)) {
            const cloudItems = data.map(mapRowToHistoryItem);
            // Combinar con items locales si alguno no está en la nube
            const localMap = new Map(getStore().history.map((it) => [it.id, it]));
            cloudItems.forEach((it) => localMap.set(it.id, it));
            const merged = Array.from(localMap.values()).sort(
              (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
            );

            set({ history: merged, cloudConfigured: true });
          }
        } catch (err: any) {
          console.error("Fallo inesperado al conectar con Supabase:", err);
        } finally {
          set({ isSyncing: false });
        }
      },

      syncLocalToCloud: async () => {
        if (!supabase || !isSupabaseConfigured()) {
          return { uploaded: 0, error: "Supabase no está configurado." };
        }

        set({ isSyncing: true });
        try {
          const localHistory = getStore().history;
          if (localHistory.length === 0) {
            return { uploaded: 0, error: null };
          }

          const rows = localHistory.map(mapHistoryItemToRow);
          const { error } = await supabase
            .from("diligencias")
            .upsert(rows, { onConflict: "id" });

          if (error) {
            return { uploaded: 0, error: error.message };
          }

          return { uploaded: rows.length, error: null };
        } catch (err: any) {
          return { uploaded: 0, error: err.message || "Error al sincronizar." };
        } finally {
          set({ isSyncing: false });
        }
      },

      initRealtimeSubscription: () => {
        if (!supabase || !isSupabaseConfigured()) {
          return () => {};
        }

        const channel = supabase
          .channel("diligencias-realtime")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "diligencias" },
            (payload) => {
              const newItem = mapRowToHistoryItem(payload.new);
              set((state) => {
                if (state.history.some((it) => it.id === newItem.id)) return state;
                return { history: [newItem, ...state.history] };
              });
            }
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "diligencias" },
            (payload) => {
              const updatedItem = mapRowToHistoryItem(payload.new);
              set((state) => ({
                history: state.history.map((it) =>
                  it.id === updatedItem.id ? updatedItem : it
                ),
              }));
            }
          )
          .on(
            "postgres_changes",
            { event: "DELETE", schema: "public", table: "diligencias" },
            (payload) => {
              const deletedId = (payload.old as any)?.id;
              if (deletedId) {
                set((state) => ({
                  history: state.history.filter((it) => it.id !== deletedId),
                }));
              }
            }
          )
          .subscribe();

        return () => {
          supabase?.removeChannel(channel);
        };
      },
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

            return JSON.stringify({
              state: {
                drafts,
                history,
                storageError: null,
                isSyncing: false,
                cloudConfigured: isSupabaseConfigured(),
              },
              version: 0,
            });
          } catch {
            return null;
          }
        },
        setItem: async (name: string, value: string) => {
          if (name !== LEGACY_KEY) return;

          try {
            const parsed = JSON.parse(value);
            const state = parsed.state || parsed;

            await db.transaction("rw", db.drafts, db.history, async () => {
              await db.drafts.clear();
              await db.history.clear();

              const drafts: DraftRow[] = Object.entries(state.drafts ?? {}).map(([key, val]) => ({
                key: key as DocumentType,
                value: JSON.stringify(val),
              }));

              const history: HistoryRow[] = (state.history ?? []).map((item: HistoryItem) => ({
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
    }
  )
);
