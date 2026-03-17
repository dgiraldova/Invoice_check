# Architecture — V1

## Target architecture
- Windows Electron desktop client for operators
- Linux backend API on LAN
- PostgreSQL as system of record

## Responsibilities
### Electron client
- operator UI
- workflow screens
- invoice tracking screens
- pending vs invoiced visibility

### Backend API
- business rules
- workflow transition enforcement
- invoice tracking and linking rules
- query endpoints for pending vs invoiced views
- persistence orchestration

### PostgreSQL
- canonical data storage
- relational integrity
- reporting/audit query base

## Key domain rule
One external invoice record can be linked to multiple visits.

## Critical V1 constraint
The system tracks invoice status and references, but does not generate or issue invoices.

## Immediate implementation priority
1. Visits + workflow transitions through pending_invoicing
2. Invoice tracking record + multi-visit linking
3. Pending vs invoiced visibility
