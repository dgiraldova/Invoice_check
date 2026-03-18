# Packaging Notes

## Current status
Windows portable packaging is now working from this Linux environment.

Verified artifact:
- `release/Facturacion Visitas 0.1.0.exe`

## Root cause of the original failure
The previous build pipeline ran:
- `tsc -p tsconfig.main.json`
- then `vite build`

That caused Vite to clear `dist/` after Electron main/preload had already been emitted, so `electron-builder` failed with:
- `Application entry file "dist/main/main.js" ... does not exist`

## Fixes applied
1. Changed app build order to:
   - `vite build && tsc -p tsconfig.main.json`
2. Disabled Windows executable editing/signing during Linux cross-build:
   - `build.win.signAndEditExecutable = false`

## Why the second fix was needed
On Linux, electron-builder may try to edit/sign the Windows executable, which can require Wine even for unsigned portable builds in constrained environments.
Setting `signAndEditExecutable: false` avoids that requirement for this Phase-1 beta packaging path.

## Packaging command
```bash
npm run dist:win
```

## Expected output
- `release/Facturacion Visitas 0.1.0.exe`
- `release/win-unpacked/`

## Notes for later hardening
These are not blockers for Phase 1, but should be revisited later:
- add proper `description` and `author` in `package.json`
- add app icon / branding assets
- decide whether to keep portable target only or also produce NSIS installer
- if Windows code signing is desired later, re-enable the relevant builder settings in a signing-capable environment
