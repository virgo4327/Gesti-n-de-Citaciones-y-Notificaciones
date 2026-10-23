import { create } from "zustand";
import type { DocumentPayload, DocumentType, HistoryItem } from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

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

export const useDocumentStore = create<Store>()((set, getStore) => ({
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

    // Actualización inmediata en estado en memoria
    set((state) => ({ history: [item, ...state.history] }));

    // Inserción directa en la base de datos de Supabase
    if (supabase && isSupabaseConfigured()) {
      const row = mapHistoryItemToRow(item);
      supabase
        .from("diligencias")
        .insert([row])
        .then(({ error }) => {
          if (error) {
            console.error("Error insertando diligencia en Supabase:", error);
            set({ storageError: `Error al guardar en Supabase: ${error.message}` });
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

    // Actualización directa en la base de datos de Supabase
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
            set({ storageError: `Error al actualizar en Supabase: ${error.message}` });
          }
        });
    }
  },

  deleteHistory: (id) => {
    set((state) => ({ history: state.history.filter((item) => item.id !== id) }));

    // Eliminación directa en la base de datos de Supabase
    if (supabase && isSupabaseConfigured()) {
      supabase
        .from("diligencias")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            console.error("Error eliminando diligencia en Supabase:", error);
            set({ storageError: `Error al eliminar en Supabase: ${error.message}` });
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
    set({ isSyncing: true, storageError: null });

    try {
      // Consultar únicamente la base de datos central en Supabase
      const { data, error } = await supabase
        .from("diligencias")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al consultar Supabase:", error);
        set({ storageError: `Error de base de datos: ${error.message}` });
        return;
      }

      if (data && Array.isArray(data)) {
        const cloudItems = data.map(mapRowToHistoryItem);
        // La lista se reemplaza 100% con los datos de Supabase (sin combinar con datos locales viejos)
        set({ history: cloudItems, cloudConfigured: true });
      }
    } catch (err: any) {
      console.error("Fallo inesperado al conectar con Supabase:", err);
      set({ storageError: "No se pudo conectar a la base de datos de Supabase." });
    } finally {
      set({ isSyncing: false });
    }
  },

  syncLocalToCloud: async () => {
    // Si no hay datos que sincronizar o no está configurado
    if (!supabase || !isSupabaseConfigured()) {
      return { uploaded: 0, error: "Supabase no está configurado." };
    }

    set({ isSyncing: true });
    try {
      const currentHistory = getStore().history;
      if (currentHistory.length === 0) {
        return { uploaded: 0, error: null };
      }

      const rows = currentHistory.map(mapHistoryItemToRow);
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
}));
