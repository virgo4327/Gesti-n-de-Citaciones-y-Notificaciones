import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

function PageFallback() {
  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-paper">
      <p className="text-lg font-black text-police">Cargando…</p>
    </div>
  );
}

const Home = lazy(() => import("./pages/Home"));
const EditorPageLazy = lazy(() => import("./pages/EditorPage"));
const HistorialPageLazy = lazy(() => import("./pages/HistorialPage"));

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<><Suspense fallback={<PageFallback />}><Home /></Suspense></>} />
        <Route path="/editor/:tipo" element={<><Suspense fallback={<PageFallback />}><EditorPageLazy /></Suspense></>} />
        <Route path="/historial" element={<><Suspense fallback={<PageFallback />}><HistorialPageLazy /></Suspense></>} />
      </Routes>
    </Suspense>
  );
}
