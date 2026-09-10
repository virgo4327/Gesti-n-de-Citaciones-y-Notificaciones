import type {
  A2Data,
  A3Data,
  A4Data,
  A5Data,
  BaseCitation,
  DocumentPayload,
  DocumentType,
} from "../../types";
import { parsearFechaDocumento } from "../../lib/docxGenerator";

const logoPnp = new URL("/assets/logo_pnp.png", window.location.origin).toString();
const footerDoc = new URL("/assets/footer_doc.png", window.location.origin).toString();
const selloPng = new URL("/assets/sello.png", window.location.origin).toString();

export default function DocumentPreview({ type, data }: { type: DocumentType; data: DocumentPayload }) {
  const d = data as any;
  const { diaDoc, mesDoc, anioDoc } = parsearFechaDocumento(d.fechaDocumento);

  const isA2 = type === "a2";
  const isA3 = type === "a3";
  const isA4 = type === "a4";
  const isA5 = type === "a5";

  // If legacy document type
  if (!isA2 && !isA3 && !isA4 && !isA5) {
    return <LegacyPreview data={data} />;
  }

  return (
    <div
      className="doc-paper mx-auto bg-white shadow-soft"
      style={{
        width: 794,
        minHeight: 1123,
        paddingTop: 80,
        paddingLeft: 85,
        paddingRight: 70,
        paddingBottom: 60,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
        fontSize: 13,
        lineHeight: 1.4,
      }}
    >
      {/* ── ENCABEZADO OFICIAL ── */}
      <div style={{ position: "absolute", top: "12px", left: "35px", right: "35px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <img src={logoPnp} alt="PNP" style={{ height: "95px", width: "auto", objectFit: "contain" }} />
        
        <div style={{ textAlign: "right", fontSize: 11, color: "#1e293b", maxWidth: "340px", lineHeight: 1.25 }}>
          <p className="m-0" style={{ fontWeight: "bold" }}>
            Referencia: <span style={{ fontWeight: "normal" }}>{d.referencia || "........................"}</span>
          </p>
          <p className="m-0" style={{ fontWeight: "bold", marginTop: 2 }}>
            Encargado de la investigación: <span style={{ fontWeight: "normal" }}>ST3 PNP Cieza Guillén Marcos</span>
          </p>
          <p className="m-0" style={{ fontWeight: "bold", marginTop: 2 }}>
            Teléfono de la Unidad Policial: <span style={{ fontWeight: "normal" }}>906758584</span>
          </p>
        </div>
      </div>

      {/* ── TÍTULO DEL DOCUMENTO ── */}
      <div style={{ marginTop: 25, marginBottom: 15 }}>
        <h1 style={{ fontFamily: "Impact, Arial Black, sans-serif", fontSize: 16, textAlign: "left", margin: 0 }}>
          <span style={{ borderBottom: "2px solid black", paddingBottom: "2px", display: "inline-block" }}>
            {isA4 || isA5 ? "NOTIFICACIÓN POLICIAL" : "CITACIÓN POLICIAL"} N° {d.numero || "___"}{" "}
            - 2026-COMOPPOL/ DIRNIC-DIRCOCOR-DIVIDCAP-DEPDICC-IQUITOS
          </span>
        </h1>
      </div>

      {/* ── CUERPO SEGÚN EL TIPO DE DOCUMENTO ── */}
      {(isA2 || isA3) && <A2A3Body data={d as A2Data | A3Data} />}
      {isA4 && <A4Body data={d as A4Data} />}
      {isA5 && <A5Body data={d as A5Data} />}

      {/* ── FECHA IQUITOS ── */}
      <div className="mt-4 flex justify-end">
        <p className="m-0" style={{ fontSize: 13 }}>
          Iquitos, {diaDoc} de {mesDoc} del {anioDoc}
        </p>
      </div>

      {/* ── SECCIÓN ENTERADO Y SELLOS ── */}
      <div className="mt-6 flex justify-between items-start" style={{ position: "relative" }}>
        <div style={{ fontSize: 12, lineHeight: 1.6, width: "320px" }}>
          <p className="m-0" style={{ fontWeight: "bold", textDecoration: "underline", marginBottom: 3 }}>
            ENTERADO:
          </p>
          <p className="m-0">Fecha y Hora: ....................................................</p>
          <p className="m-0">Nombres y apellidos: ...........................................</p>
          <p className="m-0">DNI: ....................................................................</p>
          <p className="m-0">Parentesco: ........................................................</p>
          <p className="m-0">Firma: ................................................................</p>
        </div>

        <div style={{ position: "relative", width: "240px", height: "120px" }}>
          <img
            src={selloPng}
            alt="Sello"
            style={{ width: "210px", height: "auto", objectFit: "contain", position: "absolute", top: "-20px", right: "0" }}
          />
        </div>
      </div>

      {/* ── ANEXO (Para A4 y A5) ── */}
      {(isA4 || isA5) && (
        <div className="mt-2 text-xs text-slate-700 italic">
          Se anexa la Disposición Fiscal N° {d.disposicionFiscal || "___"}, a folios {d.folios || "___"}.
        </div>
      )}

      {/* ── PIE DE PÁGINA ── */}
      <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)" }}>
        <img src={footerDoc} alt="Pie de página" style={{ height: "48px", width: "auto", objectFit: "contain" }} />
      </div>
    </div>
  );
}

function A2A3Body({ data }: { data: A2Data | A3Data }) {
  return (
    <div className="grid gap-2 text-justify" style={{ wordBreak: "break-word" }}>
      <p className="m-0">
        <strong>Sr. (a): {data.nombre || "_________________________________"}</strong>, identificado con DNI N°{" "}
        <strong>{data.dni || "________"}</strong>, domiciliado en {data.domicilio || "____________________"}, distrito{" "}
        {data.distrito || "Iquitos"}, provincia {data.provincia || "Maynas"} y departamento{" "}
        {data.departamento || "Loreto"}, con celular N° {data.celular || "S/N"} y correo electrónico{" "}
        {data.email || "S/C"}; mediante la presente, se le <strong>CITA</strong> para que concurra, al{" "}
        <strong>Departamento Desconcentrado de Investigación Contra la Corrupción de Iquitos</strong>, sito en la{" "}
        <strong>Av. Grau N° 1840 – Iquitos (Ref. frente a la puerta número 2 del Hospital Iquitos)</strong>, con la
        finalidad de rendir su declaración relacionada con el documento de la referencia, dispuesta por la{" "}
        <strong>Fiscalía Corporativa Especializada en Delitos de Corrupción de Funcionarios de Loreto</strong>, por la
        presunta comisión del delito{" "}
        <strong>Contra la Administración Pública en la modalidad de {data.modalidadDelito || "____________________"}</strong>
        , en su condición de <strong>{data.condicion || "Testigo"}</strong>, seguido en contra de{" "}
        <strong>{data.imputados || "los que resulten responsables"}</strong>, en agravio de{" "}
        <strong>{data.agraviado || "El Estado Peruano"}</strong>.
      </p>

      <p className="m-0">
        A la diligencia programada deberá de concurrir con un abogado de su libre elección, debiendo comparecer en la
        hora y fecha que a continuación se detalla:
      </p>

      <div className="my-1 pl-4 space-y-1 font-semibold">
        <p className="m-0">
          1ra. Citación: <span className="font-normal">{data.citacion1 || "____________________________________"}</span>
        </p>
        {data.citacion2 && (
          <p className="m-0">
            2da. Citación: <span className="font-normal">{data.citacion2}</span>
          </p>
        )}
        {data.citacion3 && (
          <p className="m-0">
            3ra. Citación: <span className="font-normal">{data.citacion3}</span>
          </p>
        )}
      </div>

      <p className="m-0">
        En caso de su inconcurrencia se solicitará su conducción compulsiva La conducción compulsiva por inconcurrencia
        del citado, conforme al Art. 66° y ss. del CPP, conforme a ley.
      </p>
    </div>
  );
}

function A4Body({ data }: { data: A4Data }) {
  return (
    <div className="grid gap-2 text-justify" style={{ wordBreak: "break-word" }}>
      <p className="m-0">
        <strong>Sr. (a): {data.nombre || "_________________________________"}</strong>, identificado con DNI N°{" "}
        <strong>{data.dni || "________"}</strong>, domiciliado en {data.domicilio || "____________________"}, distrito{" "}
        {data.distrito || "Iquitos"}, provincia {data.provincia || "Maynas"} y departamento{" "}
        {data.departamento || "Loreto"}, con celular N° {data.celular || "S/N"} y correo electrónico{" "}
        {data.email || "S/C"}; mediante la presente, se le <strong>NOTIFICA</strong> para que concurra al{" "}
        <strong>Departamento Desconcentrado de Investigación Contra la Corrupción – Iquitos – DEPDICC-IQUITOS</strong>,
        sito en la{" "}
        <strong>Av. Grau N° 1840 – (Ref. frente a la puerta N° 02 del Hospital de Apoyo Iquitos)</strong>, el día{" "}
        <strong>{data.fechaDiligencia || "_______________"}</strong> a horas{" "}
        <strong>{data.horaDiligencia || "________"}</strong>, con la finalidad de rendir su manifestación relacionada con
        la investigación señalada en el documento de la referencia, hecho que se hizo de conocimiento a la{" "}
        <strong>{data.fiscalia || "Fiscalía competente"}</strong>, por la presunta comisión del delito{" "}
        <strong>{data.delito || "____________________"}</strong>, seguido en su contra, en agravio de{" "}
        <strong>{data.agraviado || "El Estado Peruano"}</strong>.
      </p>

      <p className="m-0">
        A la diligencia programada deberá de concurrir con un abogado de su libre elección.
      </p>

      <p className="m-0">
        En caso de su inconcurrencia se solicitará su conducción compulsiva por inconcurrencia del notificado Art. 122° y
        ss. del CPP, conforme a ley.
      </p>
    </div>
  );
}

function A5Body({ data }: { data: A5Data }) {
  return (
    <div className="grid gap-2 text-justify" style={{ wordBreak: "break-word" }}>
      <p className="m-0">
        <strong>Sr. (a): {data.nombre || "_________________________________"}</strong>, identificado con DNI N°{" "}
        <strong>{data.dni || "________"}</strong>, domiciliado en {data.domicilio || "____________________"}, en distrito{" "}
        {data.distrito || "Iquitos"}, provincia {data.provincia || "Maynas"} y departamento{" "}
        {data.departamento || "Loreto"}, con celular N° {data.celular || "S/N"} y correo electrónico{" "}
        {data.email || "S/C"}; mediante la presente, se le <strong>NOTIFICA</strong> para que concurra al{" "}
        <strong>Departamento Desconcentrado de Investigación Contra la Corrupción – Iquitos – DEPDICC-IQUITOS</strong>,
        sito en la{" "}
        <strong>Av. Grau N° 1840 – (Ref. frente a la puerta N° 02 del Hospital de Apoyo Iquitos)</strong>, el día{" "}
        <strong>{data.fechaDiligencia || "_______________"}</strong> a horas{" "}
        <strong>{data.horaDiligencia || "________"}</strong>, con la finalidad de rendir su manifestación relacionada con
        la investigación señalada en el documento de la referencia, dispuesta por la{" "}
        <strong>{data.fiscalia || "Fiscalía a cargo"}</strong>, por la presunta comisión del delito de{" "}
        <strong>{data.delito || "____________________"}</strong>, seguido en su contra, en agravio de{" "}
        <strong>{data.agraviado || "El Estado Peruano"}</strong>
        {data.merito ? `, a mérito de ${data.merito}` : ""}.
      </p>

      <p className="m-0">
        A la diligencia programada deberá de concurrir con un abogado de su libre elección.
      </p>

      <p className="m-0">
        En caso de su inconcurrencia se solicitará su conducción compulsiva por inconcurrencia del notificado Art. 122° y
        ss. del CPP, conforme a ley.
      </p>
    </div>
  );
}

function LegacyPreview({ data }: { data: DocumentPayload }) {
  const c = data as BaseCitation;
  return (
    <div className="doc-paper mx-auto bg-white p-8 shadow-soft" style={{ width: 794, minHeight: 1123 }}>
      <h1 className="text-base font-black border-b-2 border-black pb-1 mb-4">
        DOCUMENTO N° {c.numero}
      </h1>
      <p><strong>Nombre:</strong> {c.nombre}</p>
      <p><strong>Domicilio:</strong> {c.domicilio}</p>
      <p><strong>Carpeta Fiscal:</strong> {c.carpetaFiscal}</p>
      <p><strong>Delito:</strong> {c.delito}</p>
      <p><strong>Fecha Diligencia:</strong> {c.fechaDiligencia} - {c.hora}</p>
    </div>
  );
}
