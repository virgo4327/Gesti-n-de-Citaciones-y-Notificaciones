import type { BaseCitation, DocumentPayload, DocumentType, NotificacionData } from "../../types";
import { suffix, legalItems } from "../../constants";
import { sanitizeForPdf, formatForPdf, formatearFechaDocumento } from "../../lib/sanitize";

const logoPnp      = new URL("/assets/logo_pnp.png",      window.location.origin).toString();
const encargadoPng = new URL("/assets/encargado.png",     window.location.origin).toString();
const footerDoc    = new URL("/assets/footer_doc.png",    window.location.origin).toString();
const selloPng     = new URL("/assets/sello.png",         window.location.origin).toString();

export default function DocumentPreview({ type, data }: { type: DocumentType; data: DocumentPayload }) {
  const c = data as BaseCitation;
  return (
    <div 
      className="doc-paper mx-auto bg-white shadow-soft" 
      style={{ 
        width: 794, 
        minHeight: 1123,
        paddingTop: 132,      // 3.5 cm
        paddingLeft: 132,     // 3.5 cm
        paddingRight: 76,     // 2 cm
        paddingBottom: 76,    // 2 cm
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* ── LOGOS SUPERIORES (dentro del margen) ── */}
      <div style={{ position: 'absolute', top: '25px', left: '30px', right: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <img src={logoPnp} alt="PNP" style={{ height: '100px', width: 'auto', objectFit: 'contain' }} />
        <img src={encargadoPng} alt="Encargado" style={{ height: '35px', width: 'auto', objectFit: 'contain' }} />
      </div>

      {/* ── TÍTULO ── */}
        <h1 style={{ fontFamily: "Impact, Arial Black, sans-serif", fontSize: 16, textAlign: "left", marginBottom: 4, marginTop: 8 }}>
          <span style={{ borderBottom: '2px solid black', paddingBottom: '6px', display: 'inline-block' }}>
            {type === "notificacion" ? "NOTIFICACIÓN POLICIAL" : "CITACIÓN"} N° {sanitizeForPdf(c.numero)}{suffix}
          </span>
        </h1>

      {/* ── DATOS ── */}
      <div className="grid gap-1.5 mt-4 mb-6" style={{ fontFamily: "Arial, sans-serif", fontSize: 12, lineHeight: 1.5 }}>
        <p><span style={{ display: "inline-block", width: 90, fontWeight: 600 }}>Señor (a)</span><span>:  {formatForPdf(sanitizeForPdf(c.nombre))}</span></p>
        <p><span style={{ display: "inline-block", width: 90, fontWeight: 600 }}>Domicilio</span><span>:  {sanitizeForPdf(c.domicilio)}</span></p>
        <p><span style={{ display: "inline-block", width: 90, fontWeight: 600 }}>Referencia</span><span>:  Carpeta Fiscal N° {sanitizeForPdf(c.carpetaFiscal)}</span></p>
      </div>

      {/* ── CUERPO ── */}
      {type === "notificacion" ? <NotificationBody data={data as NotificacionData} /> : <CitationBody type={type} data={data as BaseCitation} />}

      {/* ── FECHA ── */}
      <div className="mt-4 flex justify-end">
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 12 }}>
          Iquitos, {formatearFechaDocumento(sanitizeForPdf(c.fechaDocumento))}.
        </p>
      </div>

      {/* ── SELLO + ENTERADO ── */}
      <div className="mt-6 flex justify-between">
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: 12 }}>
          <p style={{ fontWeight: "bold", textDecoration: "underline", marginBottom: 4 }}>ENTERADO:</p>
          <p>FIRMA: ......................</p>
          <p>POST FIRMA: ......................</p>
          <p>D.N.I. N°: ......................</p>
          <p>FECHA/HORA: ......................</p>
          <p>RELACIÓN: ......................</p>
          <p>CELULAR: ......................</p>
        </div>
        <img src={selloPng} alt="Sello" style={{ width: '220px', height: 'auto', objectFit: 'contain', marginTop: '50px', marginLeft: '-50px' }} />
      </div>

      {/* ── PIE DE PÁGINA (dentro del margen inferior) ── */}
      <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)' }}>
        <img src={footerDoc} alt="Pie" style={{ height: '55px', width: 'auto', objectFit: 'contain' }} />
      </div>
    </div>
  );
}

/* ─── CITACIÓN ─── */
function CitationBody({ type, data }: { type: DocumentType; data: BaseCitation }) {
  const items = type === "testigo" ? legalItems.testigo : legalItems.investigado;
  return (
    <div className="grid gap-2" style={{ fontFamily: "Arial, sans-serif", fontSize: 12, lineHeight: 1.5, textAlign: "justify", wordBreak: "break-word" }}>
      <p>
        --- Mediante la presente, se le <strong>CITA</strong> a Ud., para que comparezca ante el Despacho del
        Departamento Desconcentrado de Investigación Contra la Corrupción Iquitos (DEPDICC-IQTS), sito en la Av.
        Grau N°1840 - Iquitos, <strong>{sanitizeForPdf(data.fechaDiligencia)}</strong>, a horas <strong>{sanitizeForPdf(data.hora)}</strong>, con la finalidad de
        recepcionar su {type === "testigo" ? "declaración testimonial" : "manifestación"} con relación a la
        investigación seguida contra la presunta comisión del delito contra la Administración pública en la modalidad
        de {sanitizeForPdf(data.delito)}, en agravio del Estado Peruano - {sanitizeForPdf(data.agraviado)}, {sanitizeForPdf(data.descripcionHecho)}.
      </p>
      <p>--- Asimismo, respecto a la citada diligencia, se le informa lo siguiente:</p>
      <ul style={{ paddingLeft: "0", margin: 0, listStyleType: "none", textAlign: "justify" }}>
        {items.map(item => (
          <li key={item} style={{ marginBottom: "6px", display: "flex", alignItems: "center" }}>
            <span style={{ width: "16px", flexShrink: 0, marginRight: "4px" }}>-</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p>
        --- La investigación que practica este Departamento Desconcentrado de Investigación Contra la Corrupción de la
        PNP, (DEPDICC-IQUITOS) en relación a los hechos antes referidos, conforme a la apertura de investigación de la
        Carpeta Fiscal indicada en la referencia.
      </p>
      {type === "investigado" && (
        <p>
          --- En caso de inconcurrencia se dispondrá su <strong><u>CONDUCCIÓN COMPULSIVA</u></strong>, conforme lo prevé los
          artículos 66°1), 122°2.b), 126° y 164°3 del Nuevo Código Procesal Penal.
        </p>
      )}
      <p>
        --- La presente citación se encuentra amparada en el Art. 166 de la Constitución Política del Perú,{" "}
        {type === "testigo"
          ? "Art. 11 - Numeral 4 del Decreto Legislativo 1267 - Ley de la PNP"
          : "Art. 9 Núm. 4 de la Ley N° 27238 - Ley de la PNP"} y el Art. 129 del Nuevo Código Procesal Penal.
      </p>
    </div>
  );
}

/* ─── NOTIFICACIÓN ─── */
function NotificationBody({ data }: { data: NotificacionData }) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 12, paddingLeft: 0, paddingRight: 0, wordBreak: "break-word" }}>
            <p className="mb-3" style={{ textAlign: "justify", margin: 0, marginBottom: "0.75rem" }}>
        --- Mediante el presente, se le <strong>NOTIFICA</strong> a Ud., que personal policial encargado de las
        investigaciones, ha programado en el Departamento Desconcentrado de Investigación Contra la Corrupción -
        DEPDICC-IQTS (sito en la Av. Grau N° 1840 - Iquitos), las siguientes declaraciones testimoniales conforme
        se detalla:
      </p>
        <table className="mb-3 w-full border-collapse text-center text-[10px]">
          <thead>
            <tr>{["N°","NOMBRES","CONDICIÓN","FECHA","HORA"].map(h => (
              <th key={h} className="border border-black px-3 py-1 font-bold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {data.citados.map((row, i) => (
              <tr key={row.id}>
                 <td className="border border-black px-3 py-1">{i + 1}</td>
                 <td className="border border-black px-3 py-1">{sanitizeForPdf(row.nombres)}</td>
                 <td className="border border-black px-3 py-1">{sanitizeForPdf(row.condicion)}</td>
                 <td className="border border-black px-3 py-1">{sanitizeForPdf(row.fecha)}</td>
                 <td className="border border-black px-3 py-1">{sanitizeForPdf(row.hora)}</td>
              </tr>
            ))}
          </tbody>
        </table>
            <p style={{ textAlign: "justify", margin: 0, marginTop: "12px" }}>
        Las presentes diligencias se realizan en el marco de la investigación seguida en su contra por la presunta comisión del Delito Contra la Administración Pública -{" "}
        {sanitizeForPdf(data.delito)}; en agravio del Estado Peruano.
      </p>
    </div>
  );
}
