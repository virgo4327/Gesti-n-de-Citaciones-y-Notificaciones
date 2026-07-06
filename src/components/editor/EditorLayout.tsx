import { Download, Eye, PenLine, Save, Eraser, AlertTriangle } from "lucide-react";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Sidebar from "../layout/Sidebar";
import DocumentPreview from "../preview/DocumentPreview";
import { Button } from "../ui/button";
import { useDocumentStore } from "../../store/documentStore";
import { documentDefaults } from "../../constants";
import { documentLabels } from "../../types";
import type { DocumentPayload, DocumentType, InvestigadoData, TestigoData, NotificacionData } from "../../types";
import { sanitizeFilename } from "../../lib/sanitize";
import FormInvestigado, { type FormInvestigadoHandle } from "./FormInvestigado";
import FormNotificacion, { type FormNotificacionHandle } from "./FormNotificacion";
import FormTestigo, { type FormTestigoHandle } from "./FormTestigo";
import { detectarConflictos, type Conflicto } from "../../lib/schedule";

type FormHandle = FormInvestigadoHandle | FormTestigoHandle | FormNotificacionHandle;

export default function EditorLayout({ type }: { type: DocumentType }) {
  const saveDraft  = useDocumentStore((s) => s.saveDraft);
  const addHistory = useDocumentStore((s) => s.addHistory);
  const history    = useDocumentStore((s) => s.history);
  const drafts     = useDocumentStore((s) => s.drafts);

  const formRef = useRef<FormHandle>(null);

  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [pendingTab, setPendingTab] = useState<"editor" | "preview" | null>(null);
  const [documentData, setDocumentData] = useState<DocumentPayload>(() =>
    drafts[type] ?? documentDefaults[type]
  );
  const [generating, setGenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [conflictos, setConflictos] = useState<Conflicto[] | null>(null);

  const handleValid = (data: DocumentPayload) => {
    setDocumentData(data);

    if (isSavingDraft) {
      saveDraft(type, data);
      alert("Borrador guardado correctamente");
      setIsSavingDraft(false);
    } else if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    } else {
      setActiveTab("preview");
    }
  };

  // Al hacer clic en "Vista Previa", primero dispara el submit del form
  // para capturar los valores actuales antes de cambiar de pestaña.
  const handleTabChange = (tab: "editor" | "preview") => {
    if (tab === "preview" && activeTab === "editor") {
      setPendingTab("preview");
      const form = document.getElementById("document-form") as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      } else {
        setActiveTab("preview");
      }
    } else {
      setActiveTab(tab);
    }
  };

  const verificarConflictos = (): boolean => {
    let nombre = "";
    let fecha = "";
    let hora = "";

    if (type === "investigado" || type === "testigo") {
      const d = documentData as { nombre: string; fechaDiligencia: string; hora: string };
      nombre = d.nombre;
      fecha = d.fechaDiligencia;
      hora = d.hora;
    } else if (type === "notificacion") {
      const d = documentData as { nombre: string; citados: { nombres: string; fecha: string; hora: string }[] };
      if (d.citados && d.citados.length > 0) {
        nombre = d.nombre;
        fecha = d.citados[0].fecha;
        hora = d.citados[0].hora;
      }
    }

    if (!nombre || !fecha || !hora) return false;

    const found = detectarConflictos(nombre, fecha, hora, history);
    if (found.length > 0) {
      setConflictos(found);
      return true;
    }
    return false;
  };

  const executePdfGeneration = async () => {
    setGenerating(true);

    try {
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "794px";
      container.style.height = "1123px";
      container.style.overflow = "visible";
      document.body.appendChild(container);

      const { createRoot } = await import("react-dom/client");
      const root = createRoot(container);
      
      root.render(
        <DocumentPreview type={type} data={documentData} />
      );

      await new Promise((resolve) => setTimeout(resolve, 400));

      const previewElement = container.querySelector(".doc-paper") as HTMLElement;
      if (!previewElement) {
        throw new Error("No se encontró el elemento del documento para capturar.");
      }

      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      root.unmount();
      document.body.removeChild(container);

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

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const safeNumero = sanitizeFilename(documentData.numero);
      const safeType = sanitizeFilename(type);
      pdf.save(`${safeNumero}-${safeType}.pdf`);

      addHistory(type, documentData);
    } catch (e) {
      console.error("[PDF]", e);
      alert("Error generando PDF: " + (e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleGeneratePdf = () => {
    if (!verificarConflictos()) {
      executePdfGeneration();
    }
  };

  const handleConfirmGenerate = () => {
    setConflictos(null);
    executePdfGeneration();
  };

  const handleCancelGenerate = () => {
    setConflictos(null);
  };

  const handleClear = () => {
    formRef.current?.reset();
    setDocumentData(documentDefaults[type]);
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
            <button onClick={() => handleTabChange("editor")} className={`flex h-9 items-center gap-2 rounded px-3 text-sm font-bold transition-colors ${activeTab === "editor" ? "bg-police text-white" : "text-slate-600 hover:text-police"}`}>
              <PenLine className="h-4 w-4" /> Editor
            </button>
            <button onClick={() => handleTabChange("preview")} className={`flex h-9 items-center gap-2 rounded px-3 text-sm font-bold transition-colors ${activeTab === "preview" ? "bg-police text-white" : "text-slate-600 hover:text-police"}`}>
              <Eye className="h-4 w-4" /> Vista Previa
            </button>
          </div>
        </div>

        {activeTab === "editor" && (
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            {type === "investigado"  && <FormInvestigado  ref={formRef} initial={documentData as InvestigadoData}   onValid={handleValid} />}
            {type === "testigo"      && <FormTestigo      ref={formRef} initial={documentData as TestigoData}        onValid={handleValid} />}
            {type === "notificacion" && <FormNotificacion ref={formRef} initial={documentData as NotificacionData}   onValid={handleValid} />}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button
                variant="danger"
                onClick={handleClear}
              >
                <Eraser className="h-4 w-4" /> Limpiar
              </Button>
              <Button
                variant="secondary"
                className="border border-slate-200"
                onClick={() => {
                  setIsSavingDraft(true);
                  const form = document.getElementById("document-form") as HTMLFormElement;
                  if (form) {
                    form.requestSubmit();
                  } else {
                    saveDraft(type, documentData);
                    alert("Borrador guardado");
                    setIsSavingDraft(false);
                  }
                }}
              >
                <Save className="h-4 w-4" /> Guardar borrador
              </Button>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div>
            <div className="mb-3 flex justify-end gap-2">
              <Button variant="secondary" className="border border-slate-200" onClick={() => {
                saveDraft(type, documentData);
                alert("Borrador guardado correctamente");
              }}>
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

      {conflictos && conflictos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Conflicto de horario detectado</h3>
                <p className="text-sm text-slate-500">Se encontraron coincidencias en el historial</p>
              </div>
            </div>
            <div className="mb-4 max-h-60 overflow-y-auto rounded-md border">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">N°</th>
                    <th className="px-3 py-2">Nombre</th>
                    <th className="px-3 py-2">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {conflictos.map((c, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">
                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${c.tipo === "exacto" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                          {c.tipo === "exacto" ? "Exacto" : "Cercano"}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-bold">{c.registro.numero}</td>
                      <td className="px-3 py-2">{c.registro.nombre}</td>
                      <td className="px-3 py-2 text-slate-500">
                        {c.tipo === "exacto"
                          ? `Misma fecha y hora`
                          : `${c.minutosDiferencia} min de diferencia`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" className="border border-slate-200" onClick={handleCancelGenerate}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmGenerate}>
                Generar de todas formas
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
