import { useEffect, useState, useRef } from "react";
import mammoth from "mammoth";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { parsearFechaDocumento } from "../../lib/docxGenerator";
import type { DocumentPayload, DocumentType } from "../../types";

const TEMPLATE_FILES: Record<string, string> = {
  a2: "/plantillas/A2 - Citación (víctima, testigo, perito, depositario u otro) caso de flagrancia.docx",
  a3: "/plantillas/A3 - Citación (víctima, testigo, perito, depositario u otro) - Carpeta Fiscal.docx",
  a4: "/plantillas/A4 - Notificación - Denunciado - Flagrante Delito.docx",
  a5: "/plantillas/A5 - Notificación - Denunciado - Carpeta Fiscal.docx",
};

interface Props {
  type: DocumentType;
  data: DocumentPayload;
}

export default function DocumentPreview({ type, data }: Props) {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderDocx() {
      setLoading(true);
      setError(null);

      const templatePath = TEMPLATE_FILES[type];
      if (!templatePath) {
        setError(`No hay plantilla configurada para el tipo "${type}"`);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(templatePath);
        if (!response.ok) {
          throw new Error(`No se pudo cargar la plantilla desde ${templatePath}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        // Inyectar datos del formulario en la plantilla Word
        const zip = new PizZip(arrayBuffer);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          nullGetter: () => "",
        });

        const d = data as any;
        const { diaDoc, mesDoc, anioDoc } = parsearFechaDocumento(d.fechaDocumento);

        doc.render({
          ...d,
          diaDoc,
          mesDoc,
          anioDoc,
        });

        // Obtener el buffer del docx con datos inyectados
        const renderedBuffer = doc.getZip().generate({ type: "arraybuffer" });

        // Convertir el docx renderizado a HTML usando mammoth (imágenes en base64)
        const result = await mammoth.convertToHtml(
          { arrayBuffer: renderedBuffer },
          {
            convertImage: mammoth.images.imgElement(async (image) => {
              const buffer = await image.read("base64");
              return {
                src: `data:${image.contentType};base64,${buffer}`,
              };
            }),
          }
        );

        if (!cancelled) {
          setHtml(result.value);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Error al renderizar preview:", err);
          setError(err.message || "Error al cargar la vista previa");
          setLoading(false);
        }
      }
    }

    renderDocx();
    return () => {
      cancelled = true;
    };
  }, [type, data]);

  if (loading) {
    return (
      <div
        style={{
          width: 794,
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
        }}
      >
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #e2e8f0",
              borderTop: "3px solid #1e3a8a",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ margin: 0, fontSize: 14 }}>Cargando vista previa del documento...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: 794,
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
          padding: 32,
        }}
      >
        <div style={{ textAlign: "center", color: "#dc2626" }}>
          <p style={{ fontWeight: "bold", marginBottom: 8 }}>⚠️ Error al cargar la vista previa</p>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .docx-preview-container img { max-width: 100%; height: auto; }
        .docx-preview-container table { border-collapse: collapse; width: 100%; }
        .docx-preview-container td, .docx-preview-container th { border: 1px solid #ccc; padding: 4px 8px; }
        .docx-preview-container p { margin: 0 0 6px 0; }
      `}</style>
      <div
        ref={containerRef}
        className="docx-preview-container"
        style={{
          width: 794,
          minHeight: 1123,
          background: "#fff",
          boxShadow: "0 2px 24px rgba(0,0,0,0.12)",
          borderRadius: 4,
          padding: "32px 48px",
          boxSizing: "border-box",
          fontFamily: "Arial, sans-serif",
          fontSize: 13,
          lineHeight: 1.5,
          color: "#1e1e1e",
          overflowX: "hidden",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
