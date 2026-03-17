# V1 Product Spec — Invoice / Visit Operations

## Summary
V1 is a workflow-first operations tracking system.
It tracks visits from operational progress through billing readiness and invoicing status visibility.
It does **not** generate invoices.

## Locked direction
- Architecture: Windows Electron client + Linux backend API + PostgreSQL over LAN
- V1 tracks invoicing status
- V1 does not create/generate invoices inside the app
- Admin uses separate invoicing software
- One invoice can include multiple visits

## Core workflow
visit → report in progress → report done → report reviewed → report sent → admin notified → pending invoicing → invoiced

## Core business value
The app must let operations/admin answer:
- Which visits are pending invoicing?
- Which visits have already been invoiced?
- Which external invoice reference includes which visits?

## Core entities
- Companies
- Projects
- Visits
- Invoice tracking records
- Invoice-to-visit links

## V1 requirements
- unique company NIT
- unique project_code
- unique visit_id
- DIAN code required for invoice tracking record
- visit belongs to company + project
- invoiced visits must be linked to a valid invoice tracking record
- multiple visits can link to one invoice tracking record

## Out of scope for V1
- invoice generation
- ERP/accounting integration
- Gmail/Drive/Calendar automation
- OCR/AI extraction
- mobile/web client
- multi-user roles/permissions beyond minimal internal setup
