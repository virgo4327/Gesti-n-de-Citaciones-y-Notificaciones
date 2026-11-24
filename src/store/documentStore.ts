import { create } from "zustand";
import type { DocumentPayload, DocumentType, HistoryItem } from "../types";
import {
  addDiligencia,
  updateDiligencia,
  deleteDiligencia,
  fetchDiligencias,
  subscribeDiligencias,
  isFirebaseConfigured,
} from "../lib/firebase";

const LOCAL_STORAGE_KEY = "depdicc_diligencias_history";

// --- Helpers de localStorage ---

function loadFromLocalStorage(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveToLocalStorage(history: HistoryItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn("Error guardando en localStorage:", e);
  }
}

// --- Mappers Firestore ---

function mapDocToHistoryItem(docRef: any): HistoryItem {
  const data = docRef || {};
  return {
    id: docRef.id,
    type: data.tipo || "a2",
    numero: data.numero || data.payload?.numero || "",
    nombre: data.nombre || data.payload?.nombre || "",
    generatedAt: data.created_at || new Date().toISOString(),
    payload: data.payload || {},
  };
}

function mapHistoryItemToDoc(item: HistoryItem) {
  const p = (item.payload || {}) as any;
  return {
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
  // Cargar inmediatamente desde localStorage para que la lista no esté vacía al inicio
  history: loadFromLocalStorage(),
  storageError: null,
  isSyncing: false,
  cloudConfigured: isFirebaseConfigured(),

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
    set((state) => {
      const newHistory = [item, ...state.history];
      // Persistir siempre en localStorage como respaldo
      saveToLocalStorage(newHistory);
      return { history: newHistory };
    });

    // Inserción directa en la base de datos de Firestore
    if (isFirebaseConfigured()) {
      addDiligencia(mapHistoryItemToDoc(item), item.id).catch((e) => {
        console.error("Error insertando diligencia en Firestore:", e);
        set({ storageError: `Error al guardar en Firestore: ${e.message}` });
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

      // Persistir siempre en localStorage como respaldo
      saveToLocalStorage(nextHistory);
      return { history: nextHistory };
    });

    // Actualización directa en la base de datos de Firestore
    if (updatedItem && isFirebaseConfigured()) {
      const row = mapHistoryItemToDoc(updatedItem);
      updateDiligencia(id, row).catch((e) => {
        console.error("Error actualizando diligencia en Firestore:", e);
        set({ storageError: `Error al actualizar en Firestore: ${e.message}` });
      });
    }
  },

  deleteHistory: (id) => {
    set((state) => {
      const newHistory = state.history.filter((item) => item.id !== id);
      // Persistir siempre en localStorage como respaldo
      saveToLocalStorage(newHistory);
      return { history: newHistory };
    });

    // Eliminación directa en la base de datos de Firestore
    if (isFirebaseConfigured()) {
      deleteDiligencia(id).catch((e) => {
        console.error("Error eliminando diligencia en Firestore:", e);
        set({ storageError: `Error al eliminar en Firestore: ${e.message}` });
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
    if (!isFirebaseConfigured()) {
      // Sin Firestore válido: cargar desde localStorage (ya se cargó en el init,
      // pero refrescamos por si acaso)
      const localItems = loadFromLocalStorage();
      if (localItems.length > 0) {
        set({ history: localItems, cloudConfigured: false });
      } else {
        set({ cloudConfigured: false });
      }
      return;
    }

    set({ isSyncing: true, storageError: null });

    try {
      // Consultar únicamente la base de datos central en Firestore
      const cloudItems = await fetchDiligencias();
      const mappedItems = cloudItems.map(mapDocToHistoryItem);
      // La lista se reemplaza 100% con los datos de Firestore (sin combinar con datos locales viejos)
      if (mappedItems.length > 0) {
        set({ history: mappedItems, cloudConfigured: true });
        saveToLocalStorage(mappedItems);
      } else {
        const localItems = loadFromLocalStorage();
        if (localItems.length > 0) {
          set({ history: localItems, cloudConfigured: true });
        } else {
          set({ cloudConfigured: true });
        }
      }
    } catch (err: any) {
      console.error("Fallo inesperado al conectar con Firestore:", err);
      set({ storageError: "No se pudo conectar a la base de datos de Firestore." });
      // Caer a localStorage si Supabase falla
      const localItems = loadFromLocalStorage();
      if (localItems.length > 0) {
        set({ history: localItems });
      }
    } finally {
      set({ isSyncing: false });
    }
  },

  syncLocalToCloud: async () => {
    // Si no hay datos que sincronizar o no está configurado
    if (!isFirebaseConfigured()) {
      return { uploaded: 0, error: "Firebase no está configurado." };
    }

    set({ isSyncing: true });
    try {
      const currentHistory = getStore().history;
      if (currentHistory.length === 0) {
        return { uploaded: 0, error: null };
      }

      const rows = currentHistory.map((item) => ({ item, row: mapHistoryItemToDoc(item) }));
      let uploaded = 0;
      for (const { item, row } of rows) {
        try {
          await updateDiligencia(item.id, row);
          uploaded++;
        } catch (e) {
          await addDiligencia(row, item.id).then(() => uploaded++);
        }
      }

      return { uploaded, error: null };
    } catch (err: any) {
      return { uploaded: 0, error: err.message || "Error al sincronizar." };
    } finally {
      set({ isSyncing: false });
    }
  },

  initRealtimeSubscription: () => {
    if (!isFirebaseConfigured()) {
      return () => {};
    }

    return subscribeDiligencias((items) => {
      const mappedItems = items.map(mapDocToHistoryItem);
      set((state) => {
        const existingIds = new Set(state.history.map((it) => it.id));
        const newItems = mappedItems.filter((it) => !existingIds.has(it.id));
        const updatedItems = state.history.map((it) => {
          const found = mappedItems.find((mi) => mi.id === it.id);
          return found ? found : it;
        });
        const newHistory = [...newItems, ...updatedItems];
        saveToLocalStorage(newHistory);
        return { history: newHistory };
      });
    });
  },
}));
