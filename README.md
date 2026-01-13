# Revisión de facturación de visitas

App de escritorio (Electron + React + TypeScript) para revisar el estado de facturación de visitas desde Calendar, Gmail y carpeta local.

## Scripts

```bash
npm install
npm run dev
```

- `npm run dev`: levanta Vite para el renderer y Electron con la capa main/preload.
- `npm run build`: compila main/preload y genera el build de Vite.

## Notas
- Las integraciones con Google/Filesystem son stubs por ahora.
- La configuración se guarda localmente en `localStorage`.
