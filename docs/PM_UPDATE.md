# PM Update — 2026-03-17

## Reality check
Recovered plan assumed a backend/API foundation already existed.
Current repo does **not** contain that backend tree.
Current live codebase is still an Electron-only prototype centered on Calendar/Gmail/report matching stubs.

## Revised execution order against the real repo
1. Replace review prototype UI with workflow-first visit tracking foundation in the Electron client
2. Implement visits workflow through `pending_invoicing`
3. Implement invoice tracking records and many-visits-to-one-invoice linking
4. Harden the Electron app into a demo-deployable desktop version
5. Only then start the backend/API + Postgres migration as Phase 2

## Immediate assignment guidance
- **Product/PM:** keep the vertical slice definition unchanged
- **Implementation:** adapt slice to current repo reality instead of building against nonexistent backend files
- **Guardrail:** prioritize one working end-to-end business path over architecture-perfect but non-running scaffolding
- **Delivery decision:** take the current Electron app to a deployable desktop version first; do not force the backend split yet
