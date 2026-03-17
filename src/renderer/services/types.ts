export type WorkflowStatus =
  | "created"
  | "report_in_progress"
  | "report_done"
  | "report_reviewed"
  | "report_sent"
  | "admin_notified"
  | "pending_invoicing"
  | "invoiced";

export type Company = {
  id: string;
  name: string;
  nit: string;
};

export type Project = {
  id: string;
  companyId: string;
  code: string;
  name: string;
};

export type Visit = {
  id: string;
  visitId: string;
  companyId: string;
  projectId: string;
  visitDate: string;
  inspector: string;
  status: WorkflowStatus;
  reportDoneAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reportSentAt?: string;
  adminNotifiedAt?: string;
  invoiceRecordId?: string;
  notes?: string;
};

export type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  dianCode: string;
  invoiceDate: string;
  billingMonth: string;
  companyId: string;
  visitIds: string[];
};

export type AppData = {
  companies: Company[];
  projects: Project[];
  visits: Visit[];
  invoiceRecords: InvoiceRecord[];
};
