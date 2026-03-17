# First Vertical Slice Backlog

Branch: `agency/v1-spec-backlog`

Goal: prove end-to-end pending-vs-invoiced visibility with many visits linked to one external invoice reference.

## Database
### DB-01 — Initial schema
- companies
- projects
- visits
- invoice_records
- invoice_visit_links
- optional visit_status_events

Acceptance:
- schema boots from empty DB
- unique constraints for `nit`, `project_code`, `visit_id`
- many visits can link to one invoice record

### DB-02 — Workflow and invoicing status model
Statuses:
- created
- report_in_progress
- report_done
- report_reviewed
- report_sent
- admin_notified
- pending_invoicing
- invoiced

Acceptance:
- persisted status fields exist
- visit cannot be considered invoiced without invoice link

## Backend / API
### API-01 — Service skeleton
Acceptance:
- app starts
- env config works
- DB connectivity works
- health endpoint works

### API-02 — Company/project CRUD
Acceptance:
- create/list/update company and project
- unique key validation enforced

### API-03 — Visit CRUD and workflow transitions
Acceptance:
- create/list/get visits
- transition workflow status
- invalid transitions rejected clearly

### API-04 — External invoice record endpoints
Acceptance:
- create/list/get invoice tracking records
- DIAN code required

### API-05 — Link visits to invoice record
Acceptance:
- one invoice can link many visits
- linked visits become invoiced
- duplicates prevented

### API-06 — Pending vs invoiced list endpoint
Acceptance:
- deterministic pending vs invoiced results
- company/project/month filters available

## Client / UI
### UI-01 — App shell + API wiring
### UI-02 — Company/project setup
### UI-03 — Visit creation + workflow queue
### UI-04 — Invoice tracking screen
### UI-05 — Link pending visits to invoice
### UI-06 — Pending vs invoiced visibility

## Success condition
A stakeholder can demo:
1. create company
2. create project
3. create visits
4. move visits to pending invoicing
5. create external invoice reference
6. link multiple visits to it
7. confirm pending queue shrinks and invoiced view updates
