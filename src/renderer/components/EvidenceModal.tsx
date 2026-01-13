import React from "react";
import type { VisitRow } from "../services/types";

type EvidenceType = "evento" | "correo" | "informe";

type Props = {
  open: boolean;
  type: EvidenceType | null;
  row: VisitRow | null;
  onClose: () => void;
  onOpenFile: (path: string) => void;
};

const EvidenceModal: React.FC<Props> = ({ open, type, row, onClose, onOpenFile }) => {
  if (!open || !type || !row) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal__header">
          <h3>
            {type === "evento" && "Detalle del evento"}
            {type === "correo" && "Detalle del correo"}
            {type === "informe" && "Detalle del informe"}
          </h3>
          <button className="btn btn--ghost" onClick={onClose}>
            Cerrar
          </button>
        </header>

        {type === "evento" && (
          <section className="modal__section">
            <p><strong>Empresa:</strong> {row.event.summary}</p>
            <p><strong>Inicio:</strong> {new Date(row.event.start).toLocaleString("es-CO")}</p>
            <p><strong>Fin:</strong> {new Date(row.event.end).toLocaleString("es-CO")}</p>
            <p><strong>Calendario:</strong> {row.event.calendar ?? "-"}</p>
            <p><strong>Ubicación:</strong> {row.event.location ?? "-"}</p>
            <p><strong>Descripción:</strong> {row.event.description ?? "Sin notas adicionales"}</p>
          </section>
        )}

        {type === "correo" && (
          <section className="modal__section">
            {row.billing.type ? (
              <>
                <p><strong>Tipo:</strong> {row.billing.type}</p>
                <p><strong>Asunto:</strong> {row.billing.subject ?? "-"}</p>
                <p><strong>Recibido:</strong> {row.billing.receivedAt ?? "-"}</p>
                <button className="btn btn--ghost" disabled>
                  Abrir en Gmail (placeholder)
                </button>
              </>
            ) : (
              <p>No se encontró factura ni prefactura.</p>
            )}
          </section>
        )}

        {type === "informe" && (
          <section className="modal__section">
            {row.report.found ? (
              <>
                <p><strong>Archivo:</strong> {row.report.filename}</p>
                <p><strong>Ruta:</strong> {row.report.path}</p>
                <button
                  className="btn btn--ghost"
                  onClick={() => row.report.path && onOpenFile(row.report.path)}
                >
                  Abrir (placeholder)
                </button>
              </>
            ) : (
              <p>No se encontró informe local.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default EvidenceModal;
