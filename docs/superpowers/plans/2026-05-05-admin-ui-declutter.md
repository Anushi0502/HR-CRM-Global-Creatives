# Admin UI Declutter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the admin workspace feel lighter and easier to scan without changing admin permissions or route coverage.

**Architecture:** Keep the current `/admin/*` routes intact. Reduce clutter in two layers: first the shared shell (`AppLayout`, topbar, sidebar, footer, palette), then the busiest pages (`Dashboard`, `Employees`, `Requests`, `Payroll`, `Settings`, `Leave`, `Recruitment`, `Tasks`) using progressive disclosure and fewer simultaneous controls.

**Tech Stack:** React, Vite, TypeScript, Tailwind CSS, React Router, existing `hrService` data layer

---

## Audit Summary
- `/admin` is the densest overview page: KPI row, department cards, priority queue, execution velocity, system resilience, broadcasts, and duplicate quick links all compete for attention.
- `/admin/attendance`, `/admin/employees`, `/admin/requests`, `/admin/leave`, and `/admin/payroll` each start with a dense filter/control strip that takes too much vertical space.
- `/admin/settings` is a long configuration studio with editing, simulation, risk review, checklist, and memo output all visible at once.
- `AppTopbar` renders attendance controls and a time tracker on admin pages even though those controls are employee-only.
- `QuickLinksFooter` repeats the same navigation that already exists in the sidebar, so admin pages end with redundant chrome.

## Admin Route Map
- `/admin` — overview command center
- `/admin/employees` — people directory
- `/admin/attendance` — attendance ops
- `/admin/requests` — approvals queue
- `/admin/tasks` — task ops
- `/admin/leave` — leave ops
- `/admin/recruitment` — hiring pipeline
- `/admin/payroll` — payroll ops
- `/admin/settings` — organization configuration

No route renames are required; the cleanup is visual and structural.

**Non-goals**
- Changing route paths or auth logic
- Reworking the data model or Supabase schema
- Removing admin features; this plan only changes density and disclosure

---

### Task 1: Group admin navigation

**Files:**
- Modify `client/src/types/navigation.ts`
- Modify `client/src/App.tsx`
- Modify `client/src/components/AppSidebar.tsx`
- Modify `client/src/components/WorkspaceCommandPalette.tsx`

- [ ] Add an optional `group` field to `NavItem` so admin routes can be labeled as `Overview`, `People`, `Operations`, `Finance`, and `Configuration`.
- [ ] Assign the existing admin paths to groups in `client/src/App.tsx` without changing any `path` values.
- [ ] Render grouped navigation sections in `AppSidebar` and grouped results in `WorkspaceCommandPalette`.
- [ ] Verify the grouped sidebar still exposes every admin route and the command palette still searches all nine admin destinations.

### Task 2: Make admin shell role-aware

**Files:**
- Modify `client/src/layouts/AppLayout.tsx`
- Modify `client/src/components/AppTopbar.tsx`
- Modify `client/src/components/QuickLinksFooter.tsx`

- [ ] Pass `userRole` into `AppTopbar` and use it to switch between admin and employee chrome.
- [ ] Hide `AttendanceControls` and `TimeTracker` when the current role is admin.
- [ ] Make `QuickLinksFooter` optional in `AppLayout`, then disable it for admin pages while keeping it available for employee pages if needed.
- [ ] Verify admin pages show a cleaner topbar with only date/theme/alerts/sign out and no duplicated footer nav.

### Task 3: Collapse secondary dashboard sections

**Files:**
- Modify `client/src/pages/DashboardPage.tsx`
- Modify `client/src/components/SectionCard.tsx`

- [ ] Keep the hero, KPI row, and `Priority Queue` expanded by default.
- [ ] Add a collapsed-by-default state for `Department Health`, `Execution Velocity`, and `System Resilience`.
- [ ] Preserve access to the hidden metrics behind an explicit expand/collapse control instead of removing them.
- [ ] Verify `/admin` still shows all metrics but no longer reads as one long stacked dashboard.

### Task 4: Standardize dense list-page toolbars

**Files:**
- Modify `client/src/pages/EmployeesPage.tsx`
- Modify `client/src/pages/AttendancePage.tsx`
- Modify `client/src/pages/RequestsPage.tsx`
- Modify `client/src/pages/LeavePage.tsx`
- Modify `client/src/pages/PayrollPage.tsx`
- Modify `client/src/pages/RecruitmentPage.tsx`
- Modify `client/src/pages/TasksPage.tsx`

- [ ] Reduce each page to one primary action row and move secondary controls into a compact filter panel or drawer.
- [ ] In `AttendancePage`, keep the stats row and export action visible but move the range toggle, reset, and correction details behind a smaller disclosure surface.
- [ ] In `EmployeesPage`, keep search and sort visible but hide the extra filter chips behind a toggle.
- [ ] In `RequestsPage`, move the resolution note out of the primary grid so the table can claim the full width.
- [ ] In `LeavePage`, keep the stats row and review table, but collapse the selected-request detail surface when nothing is selected.
- [ ] In `PayrollPage`, separate record creation and bulk actions so the records table is not competing with form controls.
- [ ] In `RecruitmentPage` and `TasksPage`, default to one main working surface instead of showing every control at once.
- [ ] Verify the toolbar layouts on `/admin/attendance`, `/admin/employees`, `/admin/requests`, `/admin/leave`, `/admin/payroll`, `/admin/recruitment`, and `/admin/tasks` are shorter and easier to scan.

### Task 5: Validate the shell against the real routes

**Files:**
- Modify only if validation exposes a missed layout issue

- [ ] Run `npm run lint --prefix client`.
- [ ] Run `npm run build --prefix client`.
- [ ] Use the browser to open `/admin`, `/admin/employees`, `/admin/requests`, and `/admin/settings` as the admin account and confirm the page density is visibly lower.
- [ ] Fix only the remaining spacing or disclosure issues that are obvious from that final pass.
