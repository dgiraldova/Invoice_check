import React from "react";

type Props = {
  calendarConnected: boolean;
  gmailConnected: boolean;
  reportsFolderPath: string | null;
  onConnectCalendar: () => void;
  onConnectGmail: () => void;
  onSelectFolder: () => void;
  onOpenConfig: () => void;
};

const StatusPill = ({ ok }: { ok: boolean }) => (
  <span className={`pill ${ok ? "pill--ok" : "pill--idle"}`}>
    {ok ? "Conectado" : "No conectado"}
  </span>
);

const ConnectionsPanel: React.FC<Props> = ({
  calendarConnected,
  gmailConnected,
  reportsFolderPath,
  onConnectCalendar,
  onConnectGmail,
  onSelectFolder,
  onOpenConfig
}) => {
  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <h2>Conexiones</h2>
          <p>Configura las fuentes antes de revisar visitas.</p>
        </div>
        <button className="btn btn--ghost" onClick={onOpenConfig}>
          Configuración
        </button>
      </header>
      <div className="cards">
        <article className="card">
          <div className="card__top">
            <h3>Google Calendar</h3>
            <StatusPill ok={calendarConnected} />
          </div>
          <p>Sincroniza las visitas programadas de los inspectores.</p>
          <button className="btn" onClick={onConnectCalendar}>
            {calendarConnected ? "Reconectar" : "Conectar"}
          </button>
        </article>
        <article className="card">
          <div className="card__top">
            <h3>Gmail</h3>
            <StatusPill ok={gmailConnected} />
          </div>
          <p>Busca facturas y prefacturas por empresa.</p>
          <button className="btn" onClick={onConnectGmail}>
            {gmailConnected ? "Reconectar" : "Conectar"}
          </button>
        </article>
        <article className="card">
          <div className="card__top">
            <h3>Carpeta de informes</h3>
            <StatusPill ok={!!reportsFolderPath} />
          </div>
          <p>{reportsFolderPath ? reportsFolderPath : "Selecciona la carpeta local de informes."}</p>
          <button className="btn" onClick={onSelectFolder}>
            Seleccionar carpeta...
          </button>
        </article>
      </div>
    </section>
  );
};

export default ConnectionsPanel;
