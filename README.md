# Customer Management System (CRM)

Customer Management System (CRM) is a comprehensive web application that helps businesses manage customer information, track interactions, manage leads, and improve customer relationships. This

**Files:** `index.html` · `style.css` · `script.js`

---

## How to run

**Option 1 — just open it**

Double-click `index.html` (or drag it into your browser). Done.

**Option 2 — local server (recommended, avoids any file:// quirks)**

```bash
cd crm
python3 -m http.server 8000
# then open http://localhost:8000
```

Internet access is required on first load for the CDN assets (Font Awesome, Chart.js, jsPDF, SheetJS, Inter font).

---

## Demo logins

| Role    | Email                | Password    | Access                                                            |
|---------|----------------------|-------------|-------------------------------------------------------------------|
| Admin   | `admin@nimbus.test`  | `admin123`  | Everything: customers, leads, interactions, reports, users, settings, delete, data reset |
| Manager | `manager@nimbus.test`| `manager123`| Dashboard, customers, leads, reports (no user management, no settings) |
| Agent   | `agent@nimbus.test`  | `agent123`  | Dashboard, customers, interactions, leads (no delete, no reports, no users/settings) |

You can also click the demo account buttons on the login screen, or register a new account.

---

## Pages (hash routes)

| Route                | Page                                                            |
|----------------------|-----------------------------------------------------------------|
| `#dashboard`         | Stat cards, 3 Chart.js charts, recent activity timeline         |
| `#customers`         | Search / filter / sort / paginate, add, edit, delete             |
| `#add-customer`      | Shared add + edit form with inline validation                   |
| `#customer/:id`      | Profile header, contact info, notes, interaction timeline        |
| `#interactions`      | Log + filter emails, calls and meetings                         |
| `#leads`             | Pipeline table, stage change, add/edit/delete, Convert→Customer  |
| `#reports`           | Customer & activity reports with date range, PDF/Excel export   |
| `#users`             | Admin-only user management                                      |
| `#settings`          | Company, theme, date format, currency, rows per page; JSON/CSV import-export; reset to seed |

---
## Project Structure

crm/
├── index.html      # Single-page app: auth screen, sidebar/topbar shell, all 9 page sections, modal & toast roots, CDN scripts
├── style.css       # CSS variables (light/dark themes), layout, components, responsive breakpoints (960px, 720px, 480px)
├── script.js       # All app logic, organized in 10 sections:
│                   #   1. State + seed data (12 customers, 9 leads, 25 interactions, 3 users)
│                   #   2. Storage helpers (localStorage load/save)
│                   #   3. Utilities (esc, formatters, toast, modal, Chart.js wrapper)
│                   #   4. Auth + permissions (login/register/session, role matrix)
│                   #   5. Router (hash-based, role-guarded)
│                   #   6. Page renderers (dashboard, customers, form, detail, interactions, leads, reports, users, settings)
│                   #   7. Modals (lead, user, profile, email, log interaction)
│                   #   8. Export / import (JSON, CSV, PDF, Excel)
│                   #   9. Event handlers (delegated click/change, forms, keyboard)
│                   #   10. Boot
└── README.md       # Run instructions, demo logins, route/feature reference

## Features

- Login / register with simulated sessions in `localStorage`
- Role-based UI (navigation, delete buttons and admin pages hidden per role)
- Dark mode (CSS-variable theme swap, persisted)
- Responsive layout: fixed sidebar → hamburger drawer on mobile
- Chart.js dashboard + report charts
- Export: PDF (jsPDF + AutoTable), Excel (SheetJS), full JSON backup, customers CSV
- Import: JSON backup, customers CSV
- Email simulation modal — logs an Email interaction, sends nothing
- Toast notifications, confirmation modals, empty states
- All user-entered text HTML-escaped; event delegation for dynamic tables

## Data

Seed data: **12 customers, 9 leads, 25 interactions, 3 users**.
Every change is written to `localStorage` immediately. **Settings → Reset data to seed** restores everything.

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari).
