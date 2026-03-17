# Deployable Version Plan

## Team decision
The team should **not** force the repo into the planned Linux API + PostgreSQL architecture immediately.

Reason:
- the current repo is still an Electron-only app
- the new workflow-first slice already runs and builds here
- jumping straight into a backend split now would create churn and delay a usable deliverable

## Chosen path
### Phase 1 — Demo-deployable desktop version (fastest useful path)
Ship a **single-machine Electron desktop app** that proves the business workflow end to end.

This phase should produce a version that can be:
- built reliably
- run by David or the ops team on Windows
- used to create companies/projects/visits
- move visits through workflow
- track pending vs invoiced
- register external invoice references
- link multiple visits to one invoice record

### Phase 2 — Centralized architecture migration
After the desktop version is proven and the workflow is validated, extract the backend properly:
- Linux API
- PostgreSQL
- Windows Electron client as thin UI

This avoids building infrastructure before the workflow is stable.

---

## Phase 1 scope to reach deployable
### Must-have
1. workflow transition rules enforced
2. required metadata enforced by step
3. invoice linking rules tightened
4. clear pending vs invoiced views
5. local persistence made durable enough for real use
6. sample/reset data separated from production mode
7. Windows packaging path documented and tested
8. basic operator runbook written

### Nice-to-have if time permits
- import/export backup
- edit/delete safety flows
- improved search/filtering
- better invoice detail view

---

## Concrete work allocation
### PM / orchestration
- keep branch focused on one complete usable path
- reject architectural drift until Phase 1 is usable
- define demo acceptance around business workflow, not technical purity

### Product / workflow
- lock exact business rules for each workflow transition
- lock invoice-link semantics
- define minimum operator flow for daily use

### Frontend / app implementation
- harden forms and validation
- remove or isolate obsolete review-prototype surface
- improve navigation and operator clarity
- add persistence/backup tools

### Packaging / release
- verify Electron build and package path for Windows
- document install/run/update steps

---

## Immediate next sprint order
1. enforce workflow status rules and required metadata
2. improve invoice registration and linking UX/rules
3. add persistence hardening + backup/export
4. clean out obsolete prototype modules from the old Gmail/Calendar review flow
5. produce a Windows-ready packaged build and runbook

---

## Definition of deployable for Phase 1
A build is deployable when:
- app builds cleanly
- app can be packaged for Windows
- data survives restart
- operators can complete the full flow:
  1. create company
  2. create project
  3. create visit
  4. advance workflow to pending invoicing
  5. register external invoice reference
  6. link multiple visits to one invoice
  7. clearly see pending vs invoiced
- basic backup/export exists
- there is a short runbook for installation and use

---

## Migration trigger to Phase 2
Only start the backend/Postgres migration after:
- the workflow is validated with real users
- the exact data rules stop changing every day
- the desktop version proves the screens and operator behavior

That is the point where centralization stops being speculative and starts being justified.
