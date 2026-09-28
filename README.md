# LuxuryStay Hospitality — Hotel Management System

MERN stack HMS: React (Vite) + Bootstrap 5 frontend, Node/Express (ESM) + MongoDB/Mongoose backend, JWT auth.

## Setup

**Backend**
```
cd server
npm install
# .env needs: MONGO_URI, JWT_SECRET, PORT (optional, default 5000)
npm run dev
```

**Frontend**
```
cd client
npm install
npm run dev
```

## Modules & API Endpoints

| Module | Base Route | Access |
|---|---|---|
| Auth | `/api/auth` | Public (login/register) |
| Rooms | `/api/rooms` | Staff |
| Guests | `/api/guests` | Staff |
| Reservations | `/api/reservations` | Staff |
| Invoices | `/api/invoices` | Staff |
| Housekeeping/Tasks | `/api/tasks` | Staff |
| **Staff Management** | `/api/staff` | Admin, Manager |
| **System Settings** | `/api/settings` | GET: all staff · PUT: Admin only |
| **Notifications** | `/api/notifications` | All logged-in staff (role/user targeted) |
| **Guest Feedback** | `/api/feedback` | GET/POST: staff · Respond: Admin/Manager · Delete: Admin |
| **Service Requests** | `/api/service-requests` | All logged-in staff |
| **Reports & Analytics** | `/api/reports` | Admin, Manager — revenue, occupancy, 7-day demand forecast, CSV export |

### What's newly wired together
- Invoice tax rate now defaults to the value in **System Settings** instead of a hardcoded 16%.
- New reservations trigger a notification to Receptionist staff; new maintenance/housekeeping tasks notify the relevant team — visible via the bell icon in the header.
- Staff accounts are deactivated (not deleted) via a status toggle, preserving historical records tied to their ID.
- Demand forecast (`/api/reports/forecast`) uses a 30-day moving average of new reservations — a lightweight heuristic, not a trained ML model. Good enough for a directional signal; swap in a real forecasting model later if needed.

## Role-Based Access Matrix

| Role | Landing page | Can access |
|---|---|---|
| **Admin** | Dashboard | Everything (incl. Settings, Staff delete) |
| **Manager** | Dashboard | Everything except Settings; Staff & Reports |
| **Receptionist** | Dashboard | Dashboard, Rooms, Guests, Reservations (check-in/out), Invoices, Tasks (create), Service Requests, Feedback |
| **Housekeeping / Maintenance / Laundry / Kitchen** | My Tasks | Only their own department's tasks (assigned to them or unassigned), Rooms (view-only); Housekeeping/Kitchen/Laundry also see Service Requests |

Enforced in three layers: sidebar (hidden links), frontend route guards (`ProtectedRoute allowedRoles`), and backend (`authorize(...)` on routes + task filtering/ownership check in `taskController`).

## Non-Functional Requirements — status

| Requirement | Status |
|---|---|
| JWT auth, role-based access control | ✅ Done |
| Secure HTTP headers (helmet) | ✅ Added |
| Basic rate limiting (general + stricter on login) | ✅ Added |
| Password hashing (bcrypt) | ✅ Done |
| Data encryption in transit (HTTPS) | ⚠️ Configure at deployment (reverse proxy / hosting provider — not app-level) |
| Automated backups | ⚠️ Configure via MongoDB Atlas backup policy — not app-level |
| GDPR/privacy consent flows | ⚠️ Not implemented — needs a product decision on what consent UI/copy to show |
| WCAG accessibility audit | ⚠️ Not done — requires manual audit with a screen reader + axe DevTools |
| Automated test suite (unit/integration/e2e) | ⚠️ Not implemented — recommend Jest + Supertest (backend), Vitest + React Testing Library (frontend), Playwright (e2e) |
| Security penetration testing | ⚠️ Requires a dedicated security review — out of scope for code generation |
| User guide / developer docs / demo video | ⚠️ This README covers developer basics; user guide and video are content-creation tasks, not code |

The items marked ⚠️ are either deployment/infrastructure decisions, require human judgment (consent copy, accessibility review), or are separate content deliverables (docs/video) — they aren't things that can be meaningfully "finished" by generating more code, so they're flagged here rather than stubbed out.
