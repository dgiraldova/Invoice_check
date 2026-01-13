import React, { useEffect, useState } from "react";
import type { ConfigSettings } from "../services/types";

type Props = {
  open: boolean;
  config: ConfigSettings;
  onClose: () => void;
  onSave: (config: ConfigSettings) => void;
};

const ConfigModal: React.FC<Props> = ({ open, config, onClose, onSave }) => {
  const [draft, setDraft] = useState<ConfigSettings>(config);

  useEffect(() => {
    if (open) {
      setDraft(config);
    }
  }, [open, config]);

  if (!open) {
    return null;
  }

  const updateKeywords = (value: string) => {
    const keywords = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setDraft((prev) => ({
      ...prev,
      gmail: {
        ...prev.gmail,
        keywords
      }
    }));
  };

  const updateExtensions = (value: string) => {
    const extensions = value
      .split(",")
      .map((item) => item.trim().replace(".", ""))
      .filter(Boolean);
    setDraft((prev) => ({
      ...prev,
      reports: {
        ...prev.reports,
        extensions
      }
    }));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal__header">
          <h3>Configuración de búsqueda</h3>
          <button className="btn btn--ghost" onClick={onClose}>
            Cerrar
          </button>
        </header>

        <section className="modal__section">
          <h4>Gmail</h4>
          <label className="field">
            <span>Palabras clave (separadas por coma)</span>
            <input
              type="text"
              value={draft.gmail.keywords.join(", ")}
              onChange={(event) => updateKeywords(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Ventana de fechas (± días)</span>
            <input
              type="number"
              min={1}
              value={draft.gmail.dateWindowDays}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  gmail: {
                    ...prev.gmail,
                    dateWindowDays: Number(event.target.value)
                  }
                }))
              }
            />
          </label>
        </section>

        <section className="modal__section">
          <h4>Informes</h4>
          <label className="field">
            <span>Extensiones permitidas</span>
            <input
              type="text"
              value={draft.reports.extensions.join(", ")}
              onChange={(event) => updateExtensions(event.target.value)}
            />
          </label>
          <label className="field field--inline">
            <input
              type="checkbox"
              checked={draft.reports.recursive}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  reports: {
                    ...prev.reports,
                    recursive: event.target.checked
                  }
                }))
              }
            />
            <span>Buscar en subcarpetas</span>
          </label>
        </section>

        <section className="modal__section">
          <h4>Normalización de nombre</h4>
          <label className="field field--inline">
            <input
              type="checkbox"
              checked={draft.normalize.ignoreCaseAndAccents}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  normalize: {
                    ignoreCaseAndAccents: event.target.checked
                  }
                }))
              }
            />
            <span>Ignorar mayúsculas y acentos</span>
          </label>
        </section>

        <footer className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn--primary" onClick={() => onSave(draft)}>
            Guardar configuración
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfigModal;
