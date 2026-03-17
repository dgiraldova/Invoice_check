import React, { useMemo, useState } from "react";
import type { AppData, Company, InvoiceRecord, Project, Visit, WorkflowStatus } from "./services/types";

const STORAGE_KEY = "invoice-check-v1-data";

const statuses: WorkflowStatus[] = [
  "created",
  "report_in_progress",
  "report_done",
  "report_reviewed",
  "report_sent",
  "admin_notified",
  "pending_invoicing",
  "invoiced"
];

const statusLabels: Record<WorkflowStatus, string> = {
  created: "Creada",
  report_in_progress: "Informe en progreso",
  report_done: "Informe listo",
  report_reviewed: "Informe revisado",
  report_sent: "Informe enviado",
  admin_notified: "Admin notificado",
  pending_invoicing: "Pendiente de facturar",
  invoiced: "Facturado"
};

const uid = () => Math.random().toString(36).slice(2, 10);
const nowISO = () => new Date().toISOString();
const monthFromDate = (date: string) => date.slice(0, 7);

const seedData = (): AppData => {
  const companyA = { id: uid(), name: "Joint & Welding SAS", nit: "900123456" };
  const companyB = { id: uid(), name: "Metalworks Andina", nit: "901234567" };

  const projectA = { id: uid(), companyId: companyA.id, code: "JW-001", name: "Tanques Norte" };
  const projectB = { id: uid(), companyId: companyB.id, code: "MA-002", name: "Tubería Sur" };

  const visit1: Visit = {
    id: uid(),
    visitId: "VIS-001",
    companyId: companyA.id,
    projectId: projectA.id,
    visitDate: "2026-03-14",
    inspector: "Carlos",
    status: "pending_invoicing",
    reportDoneAt: nowISO(),
    reviewedAt: nowISO(),
    reviewedBy: "Laura",
    reportSentAt: nowISO(),
    adminNotifiedAt: nowISO()
  };

  const visit2: Visit = {
    id: uid(),
    visitId: "VIS-002",
    companyId: companyA.id,
    projectId: projectA.id,
    visitDate: "2026-03-15",
    inspector: "Carlos",
    status: "pending_invoicing",
    reportDoneAt: nowISO(),
    reviewedAt: nowISO(),
    reviewedBy: "Laura",
    reportSentAt: nowISO(),
    adminNotifiedAt: nowISO()
  };

  const visit3: Visit = {
    id: uid(),
    visitId: "VIS-003",
    companyId: companyB.id,
    projectId: projectB.id,
    visitDate: "2026-03-16",
    inspector: "Ana",
    status: "report_reviewed",
    reportDoneAt: nowISO(),
    reviewedAt: nowISO(),
    reviewedBy: "Mario"
  };

  const invoice: InvoiceRecord = {
    id: uid(),
    invoiceNumber: "FAC-2026-001",
    dianCode: "DIAN-0001",
    invoiceDate: "2026-03-16",
    billingMonth: "2026-03",
    companyId: companyA.id,
    visitIds: [visit1.id]
  };

  visit1.status = "invoiced";
  visit1.invoiceRecordId = invoice.id;

  return {
    companies: [companyA, companyB],
    projects: [projectA, projectB],
    visits: [visit1, visit2, visit3],
    invoiceRecords: [invoice]
  };
};

const loadData = (): AppData => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedData();
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return seedData();
  }
};

const saveData = (data: AppData) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const nextStatus = (status: WorkflowStatus): WorkflowStatus | null => {
  const index = statuses.indexOf(status);
  if (index < 0 || index === statuses.length - 1) return null;
  return statuses[index + 1];
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => loadData());
  const [tab, setTab] = useState<"dashboard" | "master" | "visits" | "invoices">("dashboard");
  const [companyName, setCompanyName] = useState("");
  const [companyNit, setCompanyNit] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [projectCompanyId, setProjectCompanyId] = useState("");
  const [visitId, setVisitId] = useState("");
  const [visitCompanyId, setVisitCompanyId] = useState("");
  const [visitProjectId, setVisitProjectId] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [inspector, setInspector] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "invoiced">("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedVisitIds, setSelectedVisitIds] = useState<string[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dianCode, setDianCode] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState<string | null>(null);

  const persist = (next: AppData) => {
    setData(next);
    saveData(next);
  };

  const companyMap = useMemo(() => Object.fromEntries(data.companies.map((c) => [c.id, c])), [data.companies]);
  const projectMap = useMemo(() => Object.fromEntries(data.projects.map((p) => [p.id, p])), [data.projects]);

  const filteredVisits = useMemo(() => {
    return data.visits.filter((visit) => {
      if (selectedCompanyId && visit.companyId !== selectedCompanyId) return false;
      if (filter === "pending") return visit.status === "pending_invoicing";
      if (filter === "invoiced") return visit.status === "invoiced";
      return true;
    });
  }, [data.visits, filter, selectedCompanyId]);

  const pendingVisits = data.visits.filter((v) => v.status === "pending_invoicing");
  const invoicedVisits = data.visits.filter((v) => v.status === "invoiced");

  const createCompany = () => {
    if (!companyName.trim() || !companyNit.trim()) return setMessage("Empresa y NIT son obligatorios.");
    if (data.companies.some((c) => c.nit === companyNit.trim())) return setMessage("Ese NIT ya existe.");
    const company: Company = { id: uid(), name: companyName.trim(), nit: companyNit.trim() };
    persist({ ...data, companies: [...data.companies, company] });
    setCompanyName("");
    setCompanyNit("");
    setMessage("Empresa creada.");
  };

  const createProject = () => {
    if (!projectCompanyId || !projectName.trim() || !projectCode.trim()) return setMessage("Proyecto, código y empresa son obligatorios.");
    if (data.projects.some((p) => p.code === projectCode.trim())) return setMessage("Ese project_code ya existe.");
    const project: Project = { id: uid(), companyId: projectCompanyId, code: projectCode.trim(), name: projectName.trim() };
    persist({ ...data, projects: [...data.projects, project] });
    setProjectName("");
    setProjectCode("");
    setProjectCompanyId("");
    setMessage("Proyecto creado.");
  };

  const createVisit = () => {
    if (!visitId.trim() || !visitCompanyId || !visitProjectId || !visitDate || !inspector.trim()) return setMessage("Completa todos los campos de visita.");
    if (data.visits.some((v) => v.visitId === visitId.trim())) return setMessage("Ese visit_id ya existe.");
    const visit: Visit = {
      id: uid(),
      visitId: visitId.trim(),
      companyId: visitCompanyId,
      projectId: visitProjectId,
      visitDate,
      inspector: inspector.trim(),
      status: "created"
    };
    persist({ ...data, visits: [...data.visits, visit] });
    setVisitId("");
    setVisitCompanyId("");
    setVisitProjectId("");
    setInspector("");
    setMessage("Visita creada.");
  };

  const advanceVisit = (visit: Visit) => {
    const next = nextStatus(visit.status);
    if (!next) return;
    const updated: Visit = { ...visit, status: next };
    if (next === "report_done") updated.reportDoneAt = nowISO();
    if (next === "report_reviewed") {
      updated.reviewedAt = nowISO();
      updated.reviewedBy = updated.reviewedBy ?? "Supervisor";
    }
    if (next === "report_sent") updated.reportSentAt = nowISO();
    if (next === "admin_notified") updated.adminNotifiedAt = nowISO();
    persist({ ...data, visits: data.visits.map((v) => (v.id === visit.id ? updated : v)) });
  };

  const toggleSelectedVisit = (id: string) => {
    setSelectedVisitIds((current) => (current.includes(id) ? current.filter((v) => v !== id) : [...current, id]));
  };

  const createInvoiceRecord = () => {
    if (!invoiceNumber.trim() || !dianCode.trim() || !invoiceDate) return setMessage("Factura, DIAN y fecha son obligatorios.");
    if (selectedVisitIds.length === 0) return setMessage("Selecciona al menos una visita pendiente.");
    const visits = data.visits.filter((v) => selectedVisitIds.includes(v.id));
    if (visits.some((v) => v.status !== "pending_invoicing")) return setMessage("Solo puedes facturar visitas en pending_invoicing.");
    const companyId = visits[0]?.companyId;
    if (!companyId || visits.some((v) => v.companyId !== companyId)) return setMessage("Todas las visitas deben pertenecer a la misma empresa.");
    const invoice: InvoiceRecord = {
      id: uid(),
      invoiceNumber: invoiceNumber.trim(),
      dianCode: dianCode.trim(),
      invoiceDate,
      billingMonth: monthFromDate(invoiceDate),
      companyId,
      visitIds: selectedVisitIds
    };
    const nextVisits = data.visits.map((visit) =>
      selectedVisitIds.includes(visit.id)
        ? { ...visit, status: "invoiced" as WorkflowStatus, invoiceRecordId: invoice.id }
        : visit
    );
    persist({ ...data, invoiceRecords: [...data.invoiceRecords, invoice], visits: nextVisits });
    setSelectedVisitIds([]);
    setInvoiceNumber("");
    setDianCode("");
    setMessage("Factura externa registrada y visitas marcadas como facturadas.");
  };

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Seguimiento de visitas y facturación</h1>
          <p>Vertical slice v1: workflow hasta pendiente de facturar + tracking de factura externa.</p>
        </div>
        <div className="status-bar">
          <span className="status status--ok">Empresas: {data.companies.length}</span>
          <span className="status status--ok">Visitas pendientes: {pendingVisits.length}</span>
          <span className="status status--ok">Visitas facturadas: {invoicedVisits.length}</span>
        </div>
      </header>

      <main className="app__content">
        <section className="panel">
          <div className="panel__header">
            <div>
              <h2>Navegación</h2>
              <p>Primero workflow de visitas, luego tracking de facturas.</p>
            </div>
            <div className="status-bar">
              <button className="btn btn--ghost" onClick={() => setTab("dashboard")}>Dashboard</button>
              <button className="btn btn--ghost" onClick={() => setTab("master")}>Empresas/Proyectos</button>
              <button className="btn btn--ghost" onClick={() => setTab("visits")}>Visitas</button>
              <button className="btn btn--ghost" onClick={() => setTab("invoices")}>Facturas</button>
            </div>
          </div>
          {message && <p className="status-message">{message}</p>}
        </section>

        {tab === "dashboard" && (
          <section className="panel">
            <div className="panel__header panel__header--stack">
              <div>
                <h2>Resumen operativo</h2>
                <p>Esto reemplaza el prototipo de revisión por un flujo real de operaciones.</p>
              </div>
            </div>
            <div className="cards">
              <div className="card"><h3>Visitas totales</h3><strong>{data.visits.length}</strong></div>
              <div className="card"><h3>Pendientes de facturar</h3><strong>{pendingVisits.length}</strong></div>
              <div className="card"><h3>Facturadas</h3><strong>{invoicedVisits.length}</strong></div>
              <div className="card"><h3>Facturas externas</h3><strong>{data.invoiceRecords.length}</strong></div>
            </div>
          </section>
        )}

        {tab === "master" && (
          <div className="grid">
            <section className="panel">
              <h2>Crear empresa</h2>
              <div className="field"><label>Nombre</label><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
              <div className="field"><label>NIT</label><input value={companyNit} onChange={(e) => setCompanyNit(e.target.value)} /></div>
              <button className="btn btn--primary" onClick={createCompany}>Crear empresa</button>
            </section>
            <section className="panel">
              <h2>Crear proyecto</h2>
              <div className="field"><label>Empresa</label><select value={projectCompanyId} onChange={(e) => setProjectCompanyId(e.target.value)}><option value="">Selecciona</option>{data.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div className="field"><label>Nombre</label><input value={projectName} onChange={(e) => setProjectName(e.target.value)} /></div>
              <div className="field"><label>project_code</label><input value={projectCode} onChange={(e) => setProjectCode(e.target.value)} /></div>
              <button className="btn btn--primary" onClick={createProject}>Crear proyecto</button>
            </section>
          </div>
        )}

        {tab === "visits" && (
          <>
            <section className="panel">
              <h2>Crear visita</h2>
              <div className="grid">
                <div className="field"><label>visit_id</label><input value={visitId} onChange={(e) => setVisitId(e.target.value)} /></div>
                <div className="field"><label>Empresa</label><select value={visitCompanyId} onChange={(e) => setVisitCompanyId(e.target.value)}><option value="">Selecciona</option>{data.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="field"><label>Proyecto</label><select value={visitProjectId} onChange={(e) => setVisitProjectId(e.target.value)}><option value="">Selecciona</option>{data.projects.filter((p) => !visitCompanyId || p.companyId === visitCompanyId).map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}</select></div>
                <div className="field"><label>Fecha</label><input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} /></div>
                <div className="field"><label>Inspector</label><input value={inspector} onChange={(e) => setInspector(e.target.value)} /></div>
              </div>
              <button className="btn btn--primary" onClick={createVisit}>Crear visita</button>
            </section>
            <section className="panel">
              <div className="panel__header">
                <div>
                  <h2>Cola de visitas</h2>
                  <p>Prioridad PM: llevar visitas hasta pending_invoicing.</p>
                </div>
                <div className="status-bar">
                  <select value={filter} onChange={(e) => setFilter(e.target.value as any)}><option value="all">Todas</option><option value="pending">Pendientes de facturar</option><option value="invoiced">Facturadas</option></select>
                  <select value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)}><option value="">Todas las empresas</option>{data.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                </div>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>visit_id</th><th>Empresa</th><th>Proyecto</th><th>Fecha</th><th>Inspector</th><th>Estado</th><th>Acción</th></tr></thead>
                  <tbody>
                    {filteredVisits.map((visit) => (
                      <tr key={visit.id}>
                        <td>{visit.visitId}</td>
                        <td>{companyMap[visit.companyId]?.name}</td>
                        <td>{projectMap[visit.projectId]?.code}</td>
                        <td>{visit.visitDate}</td>
                        <td>{visit.inspector}</td>
                        <td>{statusLabels[visit.status]}</td>
                        <td>{visit.status !== "invoiced" ? <button className="btn btn--ghost" onClick={() => advanceVisit(visit)}>Avanzar</button> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {tab === "invoices" && (
          <>
            <section className="panel">
              <h2>Registrar factura externa</h2>
              <p>Solo permite seleccionar visitas ya listas para facturar.</p>
              <div className="grid">
                <div className="field"><label>Número de factura</label><input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} /></div>
                <div className="field"><label>Código DIAN</label><input value={dianCode} onChange={(e) => setDianCode(e.target.value)} /></div>
                <div className="field"><label>Fecha factura</label><input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} /></div>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th></th><th>visit_id</th><th>Empresa</th><th>Proyecto</th><th>Fecha</th><th>Estado</th></tr></thead>
                  <tbody>
                    {pendingVisits.map((visit) => (
                      <tr key={visit.id}>
                        <td><input type="checkbox" checked={selectedVisitIds.includes(visit.id)} onChange={() => toggleSelectedVisit(visit.id)} /></td>
                        <td>{visit.visitId}</td>
                        <td>{companyMap[visit.companyId]?.name}</td>
                        <td>{projectMap[visit.projectId]?.code}</td>
                        <td>{visit.visitDate}</td>
                        <td>{statusLabels[visit.status]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn--primary" onClick={createInvoiceRecord}>Registrar y vincular visitas</button>
            </section>
            <section className="panel">
              <h2>Facturas registradas</h2>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Factura</th><th>DIAN</th><th>Mes</th><th>Empresa</th><th>Visitas vinculadas</th></tr></thead>
                  <tbody>
                    {data.invoiceRecords.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>{invoice.invoiceNumber}</td>
                        <td>{invoice.dianCode}</td>
                        <td>{invoice.billingMonth}</td>
                        <td>{companyMap[invoice.companyId]?.name}</td>
                        <td>{invoice.visitIds.map((visitId) => data.visits.find((v) => v.id === visitId)?.visitId).filter(Boolean).join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
