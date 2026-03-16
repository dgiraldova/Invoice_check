# Software de gestión para Joint and Welding

App de escritorio (Electron + React + TypeScript) para manejo integraod de clientes, proyectos e inspectores, y hacer seguimiento a la facturación.

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
