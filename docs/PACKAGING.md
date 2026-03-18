# Packaging Plan

## Goal
Produce a Windows-installable desktop build for operators.

## Recommended tool
Use `electron-builder` for Windows packaging.

## Proposed next changes
1. add `electron-builder` as dev dependency
2. add scripts:
   - `dist:app` → build app
   - `dist:win` → package Windows artifact
3. add build metadata in `package.json`
4. set appId, productName, output directory, and Windows target
5. test package on Windows or cross-build if environment supports it

## Minimum packaging target
- Windows NSIS installer or portable executable

## Release checklist
- `npm install`
- `npm run build`
- `npm run dist:win`
- verify app launches
- verify backup export/import
- verify visit workflow
- verify invoice registration

## Open question
If we want icons, signing, auto-update, or installer branding, that is a later pass. First objective is reliable packaging.
