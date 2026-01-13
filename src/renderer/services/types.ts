export type VisitEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  calendar?: string | null;
  location?: string | null;
  description?: string | null;
};

export type BillingResult = {
  type: "factura" | "prefactura" | null;
  subject?: string;
  receivedAt?: string;
};

export type ReportResult = {
  found: boolean;
  path?: string;
  filename?: string;
};

export type VisitStatus =
  | "Facturado"
  | "Con prefactura"
  | "Con informe pendiente de factura o prefactura"
  | "Sin informe";

export type ConfigSettings = {
  gmail: {
    keywords: string[];
    dateWindowDays: number;
  };
  reports: {
    extensions: string[];
    recursive: boolean;
  };
  normalize: {
    ignoreCaseAndAccents: boolean;
  };
};

export type VisitRow = {
  event: VisitEvent;
  billing: BillingResult;
  report: ReportResult;
  status: VisitStatus;
  observation: string;
};
