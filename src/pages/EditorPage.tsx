import { Navigate, useParams } from "react-router-dom";
import EditorLayout from "../components/editor/EditorLayout";
import Navbar from "../components/layout/Navbar";
import { documentTypes } from "../constants";
import type { DocumentType } from "../types";

function isDocType(v: string): v is DocumentType {
  return (documentTypes as readonly string[]).includes(v);
}

export default function EditorPage() {
  const { tipo } = useParams();
  if (!tipo || !isDocType(tipo)) {
    return <Navigate to="/editor/investigado" replace />;
  }
  return (
    <>
      <Navbar />
      <EditorLayout type={tipo} />
    </>
  );
}
