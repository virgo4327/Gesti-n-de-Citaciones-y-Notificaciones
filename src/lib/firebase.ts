import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

export const COLLECTION = "diligencias";

export async function addDiligencia(data: any, docId?: string) {
  const ref = docId ? doc(db, COLLECTION, docId) : doc(collection(db, COLLECTION));
  return setDoc(ref, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function updateDiligencia(id: string, data: any) {
  return updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteDiligencia(id: string) {
  return deleteDoc(doc(db, COLLECTION, id));
}

export async function fetchDiligencias() {
  const q = query(collection(db, COLLECTION), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeDiligencias(callback: (items: any[]) => void) {
  const q = query(collection(db, COLLECTION), orderBy("created_at", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}