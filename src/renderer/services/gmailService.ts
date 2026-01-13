import type { BillingResult, ConfigSettings } from "./types";

const billingMap: Record<string, BillingResult> = {
  "Acme S.A.": {
    type: "factura",
    subject: "Factura 2301 - Acme S.A.",
    receivedAt: "2024-11-20"
  },
  "Beta Ltda": {
    type: "prefactura",
    subject: "Prefactura Beta Ltda - Visita 112",
    receivedAt: "2024-11-20"
  },
  "Comercial Andina": {
    type: null
  },
  "Delta Ingeniería": {
    type: null
  },
  "Eco Servicios": {
    type: "factura",
    subject: "Factura Eco Servicios - Noviembre",
    receivedAt: "2024-11-19"
  },
  "Fábrica Unión": {
    type: null
  }
};

export const gmailService = {
  async findBillingForCompanyOnDate(
    company: string,
    _date: string,
    _config: ConfigSettings
  ): Promise<BillingResult> {
    await new Promise((resolve) => setTimeout(resolve, 220));
    return billingMap[company] ?? { type: null };
  }
};
