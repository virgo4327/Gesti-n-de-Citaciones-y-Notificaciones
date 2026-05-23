import { Download, Eye, PenLine, Save } from "lucide-react";
import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Sidebar from "../layout/Sidebar";
import DocumentPreview from "../preview/DocumentPreview";
import { Button } from "../ui/button";
import { useDocumentStore } from "../../store/documentStore";
import { documentDefaults } from "../../constants";
import { documentLabels } from "../../types";
import type { DocumentPayload, DocumentType } from "../../types";
import FormInvestigado from "./FormInvestigado";
import FormNotificacion from "./FormNotificacion";
import FormTestigo from "./FormTestigo";

export default function EditorLayout({ type }: { type: DocumentType }) {
  const saveDraft  = useDocumentStore((s) => s.saveDraft);
  const addHistory = useDocumentStore((s) => s.addHistory);

  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [documentData, setDocumentData] = useState<DocumentPayload>(() => documentDefaults[type]);
  const [generating, setGenerating] = useState(false);

  const handleValid = (data: DocumentPayload) => {
    setDocumentData(data);
    setActiveTab("preview");
  };

  // Nueva generación de PDF usando html2canvas + jsPDF (mucho más confiable)
  const handleGeneratePdf = async () => {
    setGenerating(true);

    try {
      // Creamos un contenedor temporal oculto con el preview
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "794px";      // Ancho A4
      container.style.height = "1123px";    // Alto A4 (para que los absolute del footer funcionen bien)
      container.style.overflow = "visible";
      document.body.appendChild(container);

      // Renderizamos el mismo componente de vista previa
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(container);
      
      root.render(
        <DocumentPreview type={type} data={documentData} />
      );

      // Esperamos más tiempo para que se rendericen correctamente los elementos con position: absolute
      // (logos del encabezado, pie de página y sello)
      await new Promise((resolve) => setTimeout(resolve, 400));

      const previewElement = container.querySelector(".doc-paper") as HTMLElement;
      if (!previewElement) {
        throw new Error("No se encontró el elemento del documento para capturar.");
      }

      const canvas = await html2canvas(previewElement, {
        scale: 2, // Mejor calidad
        useCORS: true,
        logging: false,
      });

      // Limpiamos el contenedor temporal
      root.unmount();
      document.body.removeChild(container);

      // Creamos el PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Primera página
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Páginas adicionales si el documento es muy largo
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${documentData.numero}-${type}.pdf`);

      // Guardamos en el historial
      addHistory(type, documentData);
    } catch (e) {
      console.error("[PDF]", e);
      alert("Error generando PDF: " + (e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="lg:flex">
      <Sidebar />
      <section className="min-h-[calc(100vh-70px)] flex-1 bg-paper p-4 md:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-action">Editor interno</p>
            <h1 className="mt-1 text-3xl font-black text-police">{documentLabels[type]}</h1>
          </div>
          <div className="flex rounded-md border bg-white p-1">
            <button onClick={() => setActiveTab("editor")} className={`flex h-9 items-center gap-2 rounded px-3 text-sm font-bold transition-colors ${activeTab === "editor" ? "bg-police text-white" : "text-slate-600 hover:text-police"}`}>
              <PenLine className="h-4 w-4" /> Editor
            </button>
            <button onClick={() => setActiveTab("preview")} className={`flex h-9 items-center gap-2 rounded px-3 text-sm font-bold transition-colors ${activeTab === "preview" ? "bg-police text-white" : "text-slate-600 hover:text-police"}`}>
              <Eye className="h-4 w-4" /> Vista Previa
            </button>
          </div>
        </div>

        {activeTab === "editor" && (
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            {type === "investigado"  && <FormInvestigado  initial={undefined} onValid={handleValid} />}
            {type === "testigo"      && <FormTestigo      initial={undefined} onValid={handleValid} />}
            {type === "notificacion" && <FormNotificacion initial={undefined} onValid={handleValid} />}
          </div>
        )}

        {activeTab === "preview" && (
          <div>
            <div className="mb-3 flex justify-end gap-2">
              <Button variant="secondary" className="border border-slate-200" onClick={() => saveDraft(type, documentData)}>
                <Save className="h-4 w-4" /> Guardar borrador
              </Button>
              <Button onClick={handleGeneratePdf} disabled={generating}>
                <Download className="h-4 w-4" /> {generating ? "Generando..." : "Generar PDF"}
              </Button>
            </div>
            <DocumentPreview type={type} data={documentData} />
          </div>
        )}
      </section>
    </main>
  );
}
