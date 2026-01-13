import React, { useMemo, useState } from "react";
import ConnectionsPanel from "./components/ConnectionsPanel";
import QueryPanel from "./components/QueryPanel";
import ResultsSummary from "./components/ResultsSummary";
import ResultsTable from "./components/ResultsTable";
import ConfigModal from "./components/ConfigModal";
import Toast from "./components/Toast";
import EvidenceModal from "./components/EvidenceModal";
import { calendarService } from "./services/calendarService";
import { gmailService } from "./services/gmailService";
import { reportsService } from "./services/reportsService";
import { exportService } from "./services/exportService";
import type { BillingResult, ConfigSettings, ReportResult, VisitRow, VisitStatus } from "./services/types";

const DEFAULT_CONFIG: ConfigSettings = {
  gmail: {
    keywords: ["factura", "prefactura"],
    dateWindowDays: 7
  },
  reports: {
    extensions: ["pdf", "docx"],
    recursive: true
  },
  normalize: {
    ignoreCaseAndAccents: true
  }
};

const CONFIG_KEY = "revision-facturacion-config";

const loadConfig = (): ConfigSettings => {
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) {
    return DEFAULT_CONFIG;
  }
  try {
    return JSON.parse(raw) as ConfigSettings;
  } catch {
    return DEFAULT_CONFIG;
  }
};

const saveConfig = (config: ConfigSettings) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

const computeStatus = (billing: BillingResult, report: ReportResult): VisitStatus => {
  if (billing.type === "factura") {
    return "Facturado";
  }
  if (billing.type === "prefactura") {
    return "Con prefactura";
  }
  if (report.found) {
    return "Con informe pendiente de factura o prefactura";
  }
  return "Sin informe";
};

const buildObservation = (billing: BillingResult, report: ReportResult, status: VisitStatus) => {
  if (status === "Facturado") {
    return report.found
      ? "Factura y informe confirmados."
      : "Factura encontrada, informe pendiente.";
  }
  if (status === "Con prefactura") {
    return report.found
      ? "Prefactura localizada, revisar emisión final."
      : "Prefactura encontrada, informe pendiente.";
  }
  if (status === "Con informe pendiente de factura o prefactura") {
    return "Informe disponible, falta facturación en Gmail.";
  }
  return "No hay informe ni evidencia de facturación.";
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const App: React.FC = () => {
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [reportsFolderPath, setReportsFolderPath] = useState<string | null>(null);

  const [config, setConfig] = useState<ConfigSettings>(() => loadConfig());
  const [configOpen, setConfigOpen] = useState(false);

  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | VisitStatus>("Todos");

  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(
    null
  );
  const [evidenceModal, setEvidenceModal] = useState<{
    open: boolean;
    type: "evento" | "correo" | "informe" | null;
    row: VisitRow | null;
  }>({ open: false, type: null, row: null });

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = row.event.summary.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "Todos" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const handleReview = async () => {
    setLoading(true);
    setError(null);

    try {
      const visits = await calendarService.getVisitsByDate(date);
      if (visits.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }

      const results = await Promise.all(
        visits.map(async (event) => {
          const [billing, report] = await Promise.all([
            gmailService.findBillingForCompanyOnDate(event.summary, date, config),
            reportsService.findReportForCompanyOnDate(event.summary, date, reportsFolderPath, config)
          ]);
          const status = computeStatus(billing, report);
          const observation = buildObservation(billing, report, status);
          return {
            event,
            billing,
            report,
            status,
            observation
          };
        })
      );

      setRows(results);
    } catch (reviewError) {
      console.error(reviewError);
      setError("No pudimos completar la revisión. Intenta nuevamente o revisa las conexiones.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFolder = async () => {
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
      setReportsFolderPath(folder);
      setToast({ message: "Carpeta de informes seleccionada.", type: "success" });
    }
  };

  const handleSaveConfig = (nextConfig: ConfigSettings) => {
    setConfig(nextConfig);
    saveConfig(nextConfig);
    setConfigOpen(false);
    setToast({ message: "Configuración guardada localmente.", type: "success" });
  };

  const handleExport = async (type: "csv" | "xlsx" | "pdf") => {
    if (filteredRows.length === 0) {
      setToast({ message: "No hay filas para exportar con los filtros actuales.", type: "info" });
      return;
    }

    const defaultName = `visitas_${date}.${type}`;
    const filePath = await window.electronAPI.saveFileDialog(defaultName);
    if (!filePath) {
      return;
    }

    try {
      if (type === "csv") {
        await exportService.exportCSV(filteredRows, filePath);
      }
      if (type === "xlsx") {
        await exportService.exportXLSX(filteredRows, filePath);
      }
      if (type === "pdf") {
        await exportService.exportPDF(filteredRows, filePath);
      }
      setToast({ message: `Archivo ${type.toUpperCase()} exportado correctamente.`, type: "success" });
    } catch (exportError) {
      console.error(exportError);
      setToast({ message: "No se pudo exportar el archivo.", type: "error" });
    }
  };

  const openEvidence = (row: VisitRow, type: "evento" | "correo" | "informe") => {
    setEvidenceModal({ open: true, type, row });
  };

  const openReportFile = async (path: string) => {
    await window.electronAPI.openFile(path);
    setToast({ message: "Apertura de informe en preparación.", type: "info" });
  };

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Revisión de facturación de visitas</h1>
          <p>Revisa en minutos la evidencia de facturación por visita.</p>
        </div>
        <div className="status-bar">
          <span className={`status ${calendarConnected ? "status--ok" : "status--idle"}`}>
            Calendar: {calendarConnected ? "Conectado" : "No conectado"}
          </span>
          <span className={`status ${gmailConnected ? "status--ok" : "status--idle"}`}>
            Gmail: {gmailConnected ? "Conectado" : "No conectado"}
          </span>
          <span className={`status ${reportsFolderPath ? "status--ok" : "status--idle"}`}>
            Informes: {reportsFolderPath ? "Conectado" : "No conectado"}
          </span>
        </div>
      </header>

      <main className="app__content">
        <ConnectionsPanel
          calendarConnected={calendarConnected}
          gmailConnected={gmailConnected}
          reportsFolderPath={reportsFolderPath}
          onConnectCalendar={() => {
            setCalendarConnected(true);
            setToast({ message: "Calendar conectado (stub).", type: "success" });
          }}
          onConnectGmail={() => {
            setGmailConnected(true);
            setToast({ message: "Gmail conectado (stub).", type: "success" });
          }}
          onSelectFolder={handleSelectFolder}
          onOpenConfig={() => setConfigOpen(true)}
        />

        <div className="grid">
          <QueryPanel date={date} onDateChange={setDate} onReview={handleReview} loading={loading} />
          <ResultsSummary rows={rows} />
        </div>

        <section className="status-panel">
          {loading && <p className="status-message">Revisando visitas y evidencias...</p>}
          {!loading && error && <p className="status-message status-message--error">{error}</p>}
          {!loading && !error && rows.length === 0 && (
            <p className="status-message">Aún no hay resultados. Ejecuta una revisión.</p>
          )}
        </section>

        <ResultsTable
          rows={filteredRows}
          search={search}
          statusFilter={statusFilter}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          onExport={handleExport}
          onOpenEvidence={openEvidence}
        />
      </main>

      <ConfigModal
        open={configOpen}
        config={config}
        onClose={() => setConfigOpen(false)}
        onSave={handleSaveConfig}
      />

      <EvidenceModal
        open={evidenceModal.open}
        type={evidenceModal.type}
        row={evidenceModal.row}
        onClose={() => setEvidenceModal({ open: false, type: null, row: null })}
        onOpenFile={openReportFile}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
