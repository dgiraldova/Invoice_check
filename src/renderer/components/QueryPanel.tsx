import React from "react";

type Props = {
  date: string;
  onDateChange: (value: string) => void;
  onReview: () => void;
  loading: boolean;
};

const QueryPanel: React.FC<Props> = ({ date, onDateChange, onReview, loading }) => {
  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <h2>Consulta</h2>
          <p>Selecciona la fecha y revisa todas las visitas.</p>
        </div>
      </header>
      <div className="query">
        <label className="field">
          <span>Fecha</span>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
          />
        </label>
        <button className="btn btn--primary" onClick={onReview} disabled={loading}>
          {loading ? "Revisando..." : "Revisar visitas"}
        </button>
      </div>
    </section>
  );
};

export default QueryPanel;
