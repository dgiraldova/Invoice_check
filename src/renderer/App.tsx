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
const today = () => new Date().toISOString().slice(0, 10);
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
    status: "invoiced",
    reportDoneAt: nowISO(),
    reviewedAt: nowISO(),
    reviewedBy: "Laura",
    reportSentAt: nowISO(),
    adminNotifiedAt: nowISO(),
    invoiceRecordId: "seed-invoice-1"
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
    id: "seed-invoice-1",
    invoiceNumber: "FAC-2026-001",
    dianCode: "DIAN-0001",
    invoiceDate: "2026-03-16",
    billingMonth: "2026-03",
    companyId: companyA.id,
    visitIds: [visit1.id]
  };

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

type TransitionDraft = {
  reportDoneAt: string;
  reviewedBy: string;
  reviewedAt: string;
  reportSentAt: string;
  adminNotifiedAt: string;
};

const getTransitionRequirement = (visit: Visit, next: WorkflowStatus, draft: TransitionDraft) => {
  if (next === "report_done") {
    if (!draft.reportDoneAt) return "Para marcar informe listo, registra la fecha/hora del informe.";
  }
  if (next === "report_reviewed") {
    if (!visit.reportDoneAt && !draft.reportDoneAt) return "No puedes revisar un informe que no está marcado como listo.";
    if (!draft.reviewedBy.trim()) return "Para marcar informe revisado, indica quién revisó.";
    if (!draft.reviewedAt) return "Para marcar informe revisado, registra la fecha/hora de revisión.";
  }
  if (next === "report_sent") {
    if (!visit.reviewedAt && !draft.reviewedAt) return "No puedes enviar un informe que no ha sido revisado.";
    if (!draft.reportSentAt) return "Para marcar informe enviado, registra la fecha/hora de envío.";
  }
  if (next === "admin_notified") {
    if (!visit.reportSentAt && !draft.reportSentAt) return "No puedes notificar admin antes de enviar el informe.";
    if (!draft.adminNotifiedAt) return "Para notificar admin, registra la fecha/hora de notificación.";
  }
  if (next === "pending_invoicing") {
    if (!visit.adminNotifiedAt && !draft.adminNotifiedAt) return "No puedes pasar a pending_invoicing sin haber notificado a admin.";
  }
  return null;
};

const defaultDraft = (): TransitionDraft => ({
  reportDoneAt: "",
  reviewedBy: "",
  reviewedAt: "",
  reportSentAt: "",
  adminNotifiedAt: ""
});

const toInputDateTime = (value?: string) => (value ? value.slice(0, 16) : "");
const toStoredDateTime = (value: string) => (value ? new Date(value).toISOString() : "");

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
  const [visitDate, setVisitDate] = useState(today());
  const [inspector, setInspector] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "invoiced">("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedVisitIds, setSelectedVisitIds] = useState<string[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dianCode, setDianCode] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [message, setMessage] = useState<string | null>(null);
  const [activeVisitId, setActiveVisitId] = useState<string | null>(null);
  const [transitionDraft, setTransitionDraft] = useState<TransitionDraft>(defaultDraft());
  const [invoiceCompanyFilter, setInvoiceCompanyFilter] = useState("");
  const [billingMonthFilter, setBillingMonthFilter] = useState("all");
  const [invoiceView, setInvoiceView] = useState<"pending" | "registered">("pending");
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);

  const persist = (next: AppData) => {
    setData(next);
    saveData(next);
  };

  const companyMap = useMemo(() => Object.fromEntries(data.companies.map((c) => [c.id, c])), [data.companies]);
  const projectMap = useMemo(() => Object.fromEntries(data.projects.map((p) => [p.id, p])), [data.projects]);
  const activeVisit = data.visits.find((visit) => visit.id === activeVisitId) ?? null;
  const activeInvoice = data.invoiceRecords.find((invoice) => invoice.id === activeInvoiceId) ?? null;

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

  const selectablePendingVisits = useMemo(() => {
    return pendingVisits.filter((visit) => !invoiceCompanyFilter || visit.companyId === invoiceCompanyFilter);
  }, [pendingVisits, invoiceCompanyFilter]);

  const selectedVisits = data.visits.filter((visit) => selectedVisitIds.includes(visit.id));
  const selectedInvoiceCompanyId = selectedVisits[0]?.companyId ?? "";
  const monthOptions = Array.from(new Set(data.invoiceRecords.map((invoice) => invoice.billingMonth))).sort();

  const filteredInvoices = useMemo(() => {
    return data.invoiceRecords.filter((invoice) => {
      if (invoiceCompanyFilter && invoice.companyId !== invoiceCompanyFilter) return false;
      if (billingMonthFilter !== "all" && invoice.billingMonth !== billingMonthFilter) return false;
      return true;
    });
  }, [data.invoiceRecords, invoiceCompanyFilter, billingMonthFilter]);

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

  const selectVisit = (visit: Visit) => {
    setActiveVisitId(visit.id);
    setTransitionDraft({
      reportDoneAt: toInputDateTime(visit.reportDoneAt),
      reviewedBy: visit.reviewedBy ?? "",
      reviewedAt: toInputDateTime(visit.reviewedAt),
      reportSentAt: toInputDateTime(visit.reportSentAt),
      adminNotifiedAt: toInputDateTime(visit.adminNotifiedAt)
    });
  };

  const advanceVisit = () => {
    if (!activeVisit) return;
    const next = nextStatus(activeVisit.status);
    if (!next) return setMessage("Esta visita ya está en el estado final.");

    const requirement = getTransitionRequirement(activeVisit, next, transitionDraft);
    if (requirement) return setMessage(requirement);

    const updated: Visit = {
      ...activeVisit,
      status: next,
      reportDoneAt: transitionDraft.reportDoneAt ? toStoredDateTime(transitionDraft.reportDoneAt) : activeVisit.reportDoneAt,
      reviewedBy: transitionDraft.reviewedBy.trim() || activeVisit.reviewedBy,
      reviewedAt: transitionDraft.reviewedAt ? toStoredDateTime(transitionDraft.reviewedAt) : activeVisit.reviewedAt,
      reportSentAt: transitionDraft.reportSentAt ? toStoredDateTime(transitionDraft.reportSentAt) : activeVisit.reportSentAt,
      adminNotifiedAt: transitionDraft.adminNotifiedAt ? toStoredDateTime(transitionDraft.adminNotifiedAt) : activeVisit.adminNotifiedAt
    };

    const nextData = { ...data, visits: data.visits.map((visit) => (visit.id === activeVisit.id ? updated : visit)) };
    persist(nextData);
    setActiveVisitId(updated.id);
    setMessage(`Visita ${updated.visitId} movida a ${statusLabels[next]}.`);
  };

  const toggleSelectedVisit = (id: string) => {
    const targetVisit = data.visits.find((visit) => visit.id === id);
    if (!targetVisit) return;

    setSelectedVisitIds((current) => {
      const exists = current.includes(id);
      if (exists) return current.filter((visitId) => visitId !== id);

      if (current.length === 0) {
        setInvoiceCompanyFilter(targetVisit.companyId);
        return [id];
      }

      const currentVisits = data.visits.filter((visit) => current.includes(visit.id));
      const currentCompanyId = currentVisits[0]?.companyId;
      if (currentCompanyId && currentCompanyId !== targetVisit.companyId) {
        setMessage("No puedes mezclar visitas de empresas distintas en la misma factura.");
        return current;
      }

      return [...current, id];
    });
  };

  const clearInvoiceSelection = () => {
    setSelectedVisitIds([]);
    setInvoiceCompanyFilter("");
  };

  const createInvoiceRecord = () => {
    if (!invoiceNumber.trim() || !dianCode.trim() || !invoiceDate) return setMessage("Factura, DIAN y fecha son obligatorios.");
    if (data.invoiceRecords.some((invoice) => invoice.invoiceNumber === invoiceNumber.trim())) return setMessage("Ese número de factura ya está registrado.");
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
    setActiveInvoiceId(invoice.id);
    setInvoiceView("registered");
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
                <p>Ahora el workflow exige metadatos reales antes de avanzar.</p>
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

            <div className="grid grid--two">
              <section className="panel">
                <div className="panel__header">
                  <div>
                    <h2>Cola de visitas</h2>
                    <p>Selecciona una visita para avanzar con validaciones reales.</p>
                  </div>
                  <div className="status-bar">
                    <select value={filter} onChange={(e) => setFilter(e.target.value as any)}><option value="all">Todas</option><option value="pending">Pendientes de facturar</option><option value="invoiced">Facturadas</option></select>
                    <select value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)}><option value="">Todas las empresas</option>{data.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                  </div>
                </div>
                <div className="table-wrap">
                  <table className="table">
                    <thead><tr><th>visit_id</th><th>Empresa</th><th>Proyecto</th><th>Fecha</th><th>Inspector</th><th>Estado</th><th></th></tr></thead>
                    <tbody>
                      {filteredVisits.map((visit) => (
                        <tr key={visit.id} className={activeVisitId === visit.id ? "row--active" : ""}>
                          <td>{visit.visitId}</td>
                          <td>{companyMap[visit.companyId]?.name}</td>
                          <td>{projectMap[visit.projectId]?.code}</td>
                          <td>{visit.visitDate}</td>
                          <td>{visit.inspector}</td>
                          <td>{statusLabels[visit.status]}</td>
                          <td><button className="btn btn--ghost" onClick={() => selectVisit(visit)}>Gestionar</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="panel">
                <h2>Detalle y transición</h2>
                {!activeVisit && <p>Selecciona una visita para gestionar sus transiciones.</p>}
                {activeVisit && (
                  <>
                    <div className="detail-list">
                      <div><strong>visit_id:</strong> {activeVisit.visitId}</div>
                      <div><strong>Empresa:</strong> {companyMap[activeVisit.companyId]?.name}</div>
                      <div><strong>Proyecto:</strong> {projectMap[activeVisit.projectId]?.code}</div>
                      <div><strong>Estado actual:</strong> {statusLabels[activeVisit.status]}</div>
                      <div><strong>Siguiente estado:</strong> {nextStatus(activeVisit.status) ? statusLabels[nextStatus(activeVisit.status)!] : "Final"}</div>
                    </div>

                    <div className="grid">
                      <div className="field">
                        <label>Fecha/hora informe listo</label>
                        <input type="datetime-local" value={transitionDraft.reportDoneAt} onChange={(e) => setTransitionDraft((d) => ({ ...d, reportDoneAt: e.target.value }))} />
                      </div>
                      <div className="field">
                        <label>Revisado por</label>
                        <input value={transitionDraft.reviewedBy} onChange={(e) => setTransitionDraft((d) => ({ ...d, reviewedBy: e.target.value }))} />
                      </div>
                      <div className="field">
                        <label>Fecha/hora revisión</label>
                        <input type="datetime-local" value={transitionDraft.reviewedAt} onChange={(e) => setTransitionDraft((d) => ({ ...d, reviewedAt: e.target.value }))} />
                      </div>
                      <div className="field">
                        <label>Fecha/hora envío</label>
                        <input type="datetime-local" value={transitionDraft.reportSentAt} onChange={(e) => setTransitionDraft((d) => ({ ...d, reportSentAt: e.target.value }))} />
                      </div>
                      <div className="field">
                        <label>Fecha/hora notificación admin</label>
                        <input type="datetime-local" value={transitionDraft.adminNotifiedAt} onChange={(e) => setTransitionDraft((d) => ({ ...d, adminNotifiedAt: e.target.value }))} />
                      </div>
                    </div>

                    <button className="btn btn--primary" onClick={advanceVisit} disabled={activeVisit.status === "invoiced"}>Avanzar estado</button>
                  </>
                )}
              </section>
            </div>
          </>
        )}

        {tab === "invoices" && (
          <>
            <section className="panel">
              <div className="panel__header">
                <div>
                  <h2>Facturación</h2>
                  <p>Separa claramente pendientes por facturar vs facturas ya registradas.</p>
                </div>
                <div className="status-bar">
                  <button className="btn btn--ghost" onClick={() => setInvoiceView("pending")}>Pendientes</button>
                  <button className="btn btn--ghost" onClick={() => setInvoiceView("registered")}>Registradas</button>
                </div>
              </div>

              <div className="filters filters--tight">
                <label className="field">
                  <span>Empresa</span>
                  <select value={invoiceCompanyFilter} onChange={(e) => setInvoiceCompanyFilter(e.target.value)}>
                    <option value="">Todas las empresas</option>
                    {data.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Mes facturación</span>
                  <select value={billingMonthFilter} onChange={(e) => setBillingMonthFilter(e.target.value)}>
                    <option value="all">Todos</option>
                    {monthOptions.map((month) => <option key={month} value={month}>{month}</option>)}
                  </select>
                </label>
              </div>
            </section>

            {invoiceView === "pending" && (
              <div className="grid grid--two">
                <section className="panel">
                  <div className="panel__header">
                    <div>
                      <h2>Registrar factura externa</h2>
                      <p>Si eliges una visita, la selección queda bloqueada a esa empresa.</p>
                    </div>
                    <button className="btn btn--ghost" onClick={clearInvoiceSelection}>Limpiar selección</button>
                  </div>
                  <div className="grid">
                    <div className="field"><label>Número de factura</label><input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} /></div>
                    <div className="field"><label>Código DIAN</label><input value={dianCode} onChange={(e) => setDianCode(e.target.value)} /></div>
                    <div className="field"><label>Fecha factura</label><input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} /></div>
                  </div>
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th></th><th>visit_id</th><th>Empresa</th><th>Proyecto</th><th>Fecha</th><th>Estado</th></tr></thead>
                      <tbody>
                        {selectablePendingVisits.map((visit) => (
                          <tr key={visit.id} className={selectedVisitIds.includes(visit.id) ? "row--active" : ""}>
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
                  <h2>Resumen de selección</h2>
                  {selectedVisitIds.length === 0 && <p>No hay visitas seleccionadas todavía.</p>}
                  {selectedVisitIds.length > 0 && (
                    <>
                      <div className="detail-list">
                        <div><strong>Empresa bloqueada:</strong> {companyMap[selectedInvoiceCompanyId]?.name}</div>
                        <div><strong>Visitas seleccionadas:</strong> {selectedVisitIds.length}</div>
                        <div><strong>Rango fechas:</strong> {selectedVisits.map((v) => v.visitDate).sort().join(" → ")}</div>
                      </div>
                      <div className="table-wrap">
                        <table className="table">
                          <thead><tr><th>visit_id</th><th>Proyecto</th><th>Inspector</th><th>Fecha</th></tr></thead>
                          <tbody>
                            {selectedVisits.map((visit) => (
                              <tr key={visit.id}>
                                <td>{visit.visitId}</td>
                                <td>{projectMap[visit.projectId]?.code}</td>
                                <td>{visit.inspector}</td>
                                <td>{visit.visitDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </section>
              </div>
            )}

            {invoiceView === "registered" && (
              <div className="grid grid--two">
                <section className="panel">
                  <h2>Facturas registradas</h2>
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Factura</th><th>DIAN</th><th>Mes</th><th>Empresa</th><th>Visitas</th><th></th></tr></thead>
                      <tbody>
                        {filteredInvoices.map((invoice) => (
                          <tr key={invoice.id} className={activeInvoiceId === invoice.id ? "row--active" : ""}>
                            <td>{invoice.invoiceNumber}</td>
                            <td>{invoice.dianCode}</td>
                            <td>{invoice.billingMonth}</td>
                            <td>{companyMap[invoice.companyId]?.name}</td>
                            <td>{invoice.visitIds.length}</td>
                            <td><button className="btn btn--ghost" onClick={() => setActiveInvoiceId(invoice.id)}>Ver detalle</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="panel">
                  <h2>Detalle de factura</h2>
                  {!activeInvoice && <p>Selecciona una factura registrada para ver sus visitas vinculadas.</p>}
                  {activeInvoice && (
                    <>
                      <div className="detail-list">
                        <div><strong>Factura:</strong> {activeInvoice.invoiceNumber}</div>
                        <div><strong>DIAN:</strong> {activeInvoice.dianCode}</div>
                        <div><strong>Fecha:</strong> {activeInvoice.invoiceDate}</div>
                        <div><strong>Empresa:</strong> {companyMap[activeInvoice.companyId]?.name}</div>
                        <div><strong>Mes:</strong> {activeInvoice.billingMonth}</div>
                      </div>
                      <div className="table-wrap">
                        <table className="table">
                          <thead><tr><th>visit_id</th><th>Proyecto</th><th>Inspector</th><th>Estado</th></tr></thead>
                          <tbody>
                            {activeInvoice.visitIds.map((visitId) => data.visits.find((visit) => visit.id === visitId)).filter(Boolean).map((visit) => (
                              <tr key={visit!.id}>
                                <td>{visit!.visitId}</td>
                                <td>{projectMap[visit!.projectId]?.code}</td>
                                <td>{visit!.inspector}</td>
                                <td>{statusLabels[visit!.status]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
