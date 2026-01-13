import type { VisitEvent } from "./types";

const buildDateTime = (date: string, time: string) => `${date}T${time}:00`;

export const calendarService = {
  async getVisitsByDate(date: string): Promise<VisitEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return [
      {
        id: "evt-1",
        summary: "Acme S.A.",
        start: buildDateTime(date, "08:30"),
        end: buildDateTime(date, "09:15"),
        calendar: "Inspecciones Norte",
        location: "Planta principal"
      },
      {
        id: "evt-2",
        summary: "Beta Ltda",
        start: buildDateTime(date, "09:45"),
        end: buildDateTime(date, "10:30"),
        calendar: "Inspecciones Norte",
        location: "Sucursal Centro"
      },
      {
        id: "evt-3",
        summary: "Comercial Andina",
        start: buildDateTime(date, "11:00"),
        end: buildDateTime(date, "11:50"),
        calendar: "Inspecciones Andina",
        location: "Bodega 2"
      },
      {
        id: "evt-4",
        summary: "Delta Ingeniería",
        start: buildDateTime(date, "12:20"),
        end: buildDateTime(date, "13:10"),
        calendar: "Inspecciones Andina",
        location: "Obra 14"
      },
      {
        id: "evt-5",
        summary: "Eco Servicios",
        start: buildDateTime(date, "14:10"),
        end: buildDateTime(date, "15:00"),
        calendar: "Inspecciones Sur",
        location: "Parque Industrial"
      },
      {
        id: "evt-6",
        summary: "Fábrica Unión",
        start: buildDateTime(date, "16:00"),
        end: buildDateTime(date, "16:45"),
        calendar: "Inspecciones Sur",
        location: "Fábrica 3"
      }
    ];
  }
};
