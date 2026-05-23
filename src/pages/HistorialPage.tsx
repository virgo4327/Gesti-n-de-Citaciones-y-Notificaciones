import { Download, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReactDOM from "react-dom/client";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { Button } from "../components/ui/button";
import { useDocumentStore } from "../store/documentStore";
import { documentLabels, type DocumentType } from "../types";
import DocumentPreview from "../components/preview/DocumentPreview";

export default function HistorialPage() {
  const { history, deleteHistory } = useDocumentStore();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "todos">("todos");

  const filtered = useMemo(() => {
    return history.filter((item) => {
      const matchesQuery = `${item.numero} ${item.nombre}`.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "todos" || item.type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [history, query, typeFilter]);

  // Función reutilizable para generar PDF desde historial
  const handleDownloadFromHistory = async (item: any) => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "794px";
    container.style.height = "1123px";   // Alto A4
    container.style.overflow = "visible";
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(
      <DocumentPreview type={item.type} data={item.payload} />
    );

    // Más tiempo para renderizado correcto de elementos absolute (logos y pie)
    await new Promise((r) => setTimeout(r, 400));

    const element = container.querySelector(".doc-paper") as HTMLElement;
    if (!element) {
      alert("Error al generar el PDF");
      root.unmount();
      document.body.removeChild(container);
      return;
    }

    const canvas = await html2canvas(element, { scale: 2 });
    root.unmount();
    document.body.removeChild(container);

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${item.numero}-${item.type}.pdf`);
  };

  return (
    <>
      <Navbar />
      <main className="lg:flex">
        <Sidebar />
        <section className="min-h-[calc(100vh-70px)] flex-1 bg-paper p-4 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-police">Historial</h1>
            <p className="mt-1 text-slate-600">Documentos generados y guardados localmente.</p>
          </div>

          <div className="mb-5 grid gap-3 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-[1fr_240px]">
            <label className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                className="field pl-10"
                placeholder="Buscar por número o nombre"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              className="field"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as DocumentType | "todos")}
            >
              <option value="todos">Todos los tipos</option>
              <option value="investigado">Investigado</option>
              <option value="testigo">Testigo</option>
              <option value="notificacion">Notificación</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-police text-white">
                <tr>
                  <th className="px-4 py-3">N°</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Fecha gen.</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 font-bold">{item.numero}</td>
                    <td className="px-4 py-3">{documentLabels[item.type]}</td>
                    <td className="px-4 py-3">{item.nombre}</td>
                    <td className="px-4 py-3">{new Date(item.generatedAt).toLocaleDateString("es-PE")}</td>
                    <td className="flex gap-2 px-4 py-3">
                      <Button
                        type="button"
                        className="h-9 px-3"
                        onClick={() => handleDownloadFromHistory(item)}
                      >
                        <Download className="h-4 w-4" /> PDF
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="h-9 px-3"
                        onClick={() => deleteHistory(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      No hay documentos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
