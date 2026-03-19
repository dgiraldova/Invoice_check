# V1 Release Checklist — Desktop Beta

## Goal
Call the project **V1 desktop beta** only when the packaged Windows app proves the real operator workflow end-to-end without critical blockers.

---

## MUST-PASS

### 1. Windows package launches
- [ ] `Facturacion Visitas 0.1.0.exe` launches on Windows
- [ ] App opens without crash
- [ ] Main screens render correctly

### 2. Core operator flow works end-to-end
- [ ] Create company
- [ ] Create project
- [ ] Create visit
- [ ] Advance visit through workflow to `pending_invoicing`
- [ ] Register external invoice with DIAN code
- [ ] Link multiple visits to one invoice
- [ ] Pending count decreases correctly
- [ ] Invoiced/registered view updates correctly

### 3. Persistence works
- [ ] Close app
- [ ] Reopen app
- [ ] Data is still present and consistent

### 4. Backup flow works
- [ ] Export backup JSON
- [ ] Import backup JSON
- [ ] Restored data matches expected state

### 5. Critical validation rules hold
- [ ] Duplicate NIT blocked
- [ ] Duplicate `project_code` blocked
- [ ] Duplicate `visit_id` blocked
- [ ] Duplicate invoice number blocked
- [ ] Mixed-company invoice linking blocked
- [ ] Invalid workflow transitions blocked

### 6. Runbook matches reality
- [ ] `docs/RUNBOOK.md` is enough for a human to operate the app
- [ ] Install/use steps are accurate
- [ ] No misleading packaging instructions remain

---

## SHOULD-FIX

### Seed/demo handling
- [ ] Demo/seed data does not confuse production usage
- [ ] Reset/demo behavior is explicit if retained

### Operator safety UX
- [ ] Success/error messages are clear
- [ ] Empty states are understandable
- [ ] Workflow/invoice screens make next actions obvious

### Edit/recovery basics
- [ ] Limitations around edit/delete are documented clearly
- [ ] No existing action can silently corrupt state

### Docs alignment
- [ ] Docs clearly describe the current Phase 1 desktop reality
- [ ] Backend/Postgres future state is labeled as future, not present reality

### Release hygiene
- [ ] Packaging output is predictable
- [ ] Generated artifacts do not create git noise

---

## CAN-WAIT UNTIL AFTER V1
- Backend/API/Postgres migration
- Multi-user/networked architecture
- ERP/accounting integration
- OCR/AI extraction extras
- Fancy UI polish
- Advanced reporting
- Installer branding/signing/auto-update
- Refactors for elegance only

---

## Recommended execution order
1. [ ] Windows launch test
2. [ ] End-to-end operator flow test
3. [ ] Restart persistence test
4. [ ] Export/import restore test
5. [ ] Fix blockers found
6. [ ] Final docs/runbook pass
7. [ ] Declare V1 desktop beta

---

## Done enough definition
We can call this **V1 desktop beta** when:
- [ ] packaged app launches on Windows
- [ ] core workflow works end-to-end
- [ ] persistence survives restart
- [ ] backup export/import works
- [ ] no critical operator-breaking bug remains
- [ ] runbook is usable
