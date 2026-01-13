import React from "react";
import type { VisitRow } from "../services/types";

type Props = {
  rows: VisitRow[];
};

const ResultsSummary: React.FC<Props> = ({ rows }) => {
  const total = rows.length;
  const facturado = rows.filter((row) => row.status === "Facturado").length;
  const prefactura = rows.filter((row) => row.status === "Con prefactura").length;
  const informePendiente = rows.filter(
    (row) => row.status === "Con informe pendiente de factura o prefactura"
  ).length;
  const sinInforme = rows.filter((row) => row.status === "Sin informe").length;

  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <h2>Resumen</h2>
          <p>Resultados agregados de la última consulta.</p>
        </div>
      </header>
      <div className="chips">
        <div className="chip">
          <span>Total</span>
          <strong>{total}</strong>
        </div>
        <div className="chip chip--ok">
          <span>Facturado</span>
          <strong>{facturado}</strong>
        </div>
        <div className="chip chip--warn">
          <span>Prefactura</span>
          <strong>{prefactura}</strong>
        </div>
        <div className="chip chip--info">
          <span>Con informe pendiente</span>
          <strong>{informePendiente}</strong>
        </div>
        <div className="chip chip--idle">
          <span>Sin informe</span>
          <strong>{sinInforme}</strong>
        </div>
      </div>
    </section>
  );
};

export default ResultsSummary;
