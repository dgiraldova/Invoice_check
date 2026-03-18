# Operator Runbook

## Purpose
Desktop app for tracking visit workflow and external invoicing status.

## Core daily flow
1. Open the app
2. Create company if missing
3. Create project if missing
4. Create visit
5. Move visit through workflow steps with required timestamps/reviewer fields
6. When visit reaches `pending_invoicing`, register the external invoice
7. Link one or more visits to that invoice
8. Review pending vs registered invoice views

## Data safety
- The app stores a local JSON backup in the Electron user-data folder automatically
- Use **Exportar backup** regularly to create manual copies
- Use **Importar backup** to restore data on the same or another machine

## Operational rules
- Do not mark a visit invoiced directly; use the invoice registration flow
- Do not mix visits from different companies in one invoice
- Use unique NIT, `project_code`, and `visit_id`

## Recovery steps
### If the app restarts
- reopen the app; it should hydrate from local backup automatically

### If data looks wrong
- import the latest exported backup JSON

### If moving to another machine
- install the app
- export backup from old machine
- import backup on new machine

## Recommended routine
- export backup at end of day
- keep branch updates pushed to GitHub
