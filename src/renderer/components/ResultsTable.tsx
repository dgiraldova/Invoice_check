import React from "react";
import type { VisitRow, VisitStatus } from "../services/types";

type EvidenceType = "evento" | "correo" | "informe";

type Props = {
  rows: VisitRow[];
  search: string;
  statusFilter: "Todos" | VisitStatus;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: "Todos" | VisitStatus) => void;
  onExport: (type: "csv" | "xlsx" | "pdf") => void;
  onOpenEvidence: (row: VisitRow, type: EvidenceType) => void;
};

const statusClass = (status: VisitStatus) => {
  if (status === "Facturado") return "badge badge--ok";
  if (status === "Con prefactura") return "badge badge--warn";
  if (status === "Con informe pendiente de factura o prefactura") return "badge badge--info";
  return "badge badge--idle";
};

const ResultsTable: React.FC<Props> = ({
  rows,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onExport,
  onOpenEvidence
}) => {
  return (
    <section className="panel">
      <header className="panel__header panel__header--stack">
        <div>
          <h2>Resultados</h2>
          <p>Filtra por empresa o estado antes de exportar.</p>
        </div>
        <div className="actions">
          <button className="btn btn--ghost" onClick={() => onExport("csv")}>Exportar CSV</button>
          <button className="btn btn--ghost" onClick={() => onExport("xlsx")}>Exportar Excel</button>
          <button className="btn btn--ghost" onClick={() => onExport("pdf")}>Exportar PDF</button>
        </div>
      </header>

      <div className="filters">
        <label className="field">
          <span>Búsqueda por empresa</span>
          <input
            type="text"
            placeholder="Ej: Acme"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Estado</span>
          <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value as Props["statusFilter"])}>
            <option value="Todos">Todos</option>
            <option value="Facturado">Facturado</option>
            <option value="Con prefactura">Con prefactura</option>
            <option value="Con informe pendiente de factura o prefactura">
              Con informe pendiente de factura o prefactura
            </option>
            <option value="Sin informe">Sin informe</option>
          </select>
        </label>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Empresa</th>
              <th>Calendario</th>
              <th>Estado</th>
              <th>Evidencias</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.event.id}>
                <td>
                  {new Date(row.event.start).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </td>
                <td>{row.event.summary}</td>
                <td>{row.event.calendar ?? "-"}</td>
                <td>
                  <span className={statusClass(row.status)}>{row.status}</span>
                </td>
                <td>
                  <div className="evidence">
                    <button className="link" onClick={() => onOpenEvidence(row, "evento")}>
                      Ver evento
                    </button>
                    <button
                      className="link"
                      onClick={() => onOpenEvidence(row, "correo")}
                      disabled={!row.billing.type}
                    >
                      Ver correo
                    </button>
                    <button
                      className="link"
                      onClick={() => onOpenEvidence(row, "informe")}
                      disabled={!row.report.found}
                    >
                      Ver informe
                    </button>
                  </div>
                </td>
                <td>{row.observation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="empty-state">
          <p>No hay resultados para los filtros seleccionados.</p>
        </div>
      )}
    </section>
  );
};

export default ResultsTable;
