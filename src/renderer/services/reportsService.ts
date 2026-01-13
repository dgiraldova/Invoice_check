import type { ConfigSettings, ReportResult } from "./types";

const reportMap: Record<string, ReportResult> = {
  "Acme S.A.": {
    found: true,
    path: "/informes/2024/Acme_SA_informe.pdf",
    filename: "Acme_SA_informe.pdf"
  },
  "Beta Ltda": {
    found: true,
    path: "/informes/2024/Beta_Ltda_informe.docx",
    filename: "Beta_Ltda_informe.docx"
  },
  "Comercial Andina": {
    found: true,
    path: "/informes/2024/Comercial_Andina_informe.pdf",
    filename: "Comercial_Andina_informe.pdf"
  },
  "Delta Ingeniería": {
    found: true,
    path: "/informes/2024/Delta_Ingenieria_informe.pdf",
    filename: "Delta_Ingenieria_informe.pdf"
  },
  "Eco Servicios": {
    found: true,
    path: "/informes/2024/Eco_Servicios_informe.pdf",
    filename: "Eco_Servicios_informe.pdf"
  },
  "Fábrica Unión": {
    found: false
  }
};

export const reportsService = {
  async findReportForCompanyOnDate(
    company: string,
    _date: string,
    _folderPath: string | null,
    _config: ConfigSettings
  ): Promise<ReportResult> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    return reportMap[company] ?? { found: false };
  }
};
