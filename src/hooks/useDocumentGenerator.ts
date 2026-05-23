import type { DocumentPayload, DocumentType } from "../types";
import { useDocumentStore } from "../store/documentStore";

export function useDocumentGenerator(type: DocumentType) {
  const { addHistory, saveDraft, clearDraft } = useDocumentStore();
  return {
    saveDraft: (payload: DocumentPayload) => saveDraft(type, payload),
    registerGenerated: (payload: DocumentPayload) => addHistory(type, payload),
    clearDraft: () => clearDraft(type),
  };
}
