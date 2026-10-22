import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDocumentStore } from "./store/documentStore";

function PageFallback() {
  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-paper">
      <p className="text-lg font-black text-police">Cargando…</p>
    </div>
  );
}

const Home = lazy(() => import("./pages/Home"));
const HistorialPageLazy = lazy(() => import("./pages/HistorialPage"));
const AgendaPageLazy = lazy(() => import("./pages/AgendaPage"));

export default function App() {
  const { fetchFromCloud, initRealtimeSubscription } = useDocumentStore();

  useEffect(() => {
    fetchFromCloud();
    const unsubscribe = initRealtimeSubscription();
    return () => {
      unsubscribe();
    };
  }, [fetchFromCloud, initRealtimeSubscription]);

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/historial" element={<HistorialPageLazy />} />
        <Route path="/agenda" element={<AgendaPageLazy />} />
      </Routes>
    </Suspense>
  );
}
