# Mobile Design Prompt — CRM Application

## Context
Design a full mobile-first responsive version of a B2B CRM application. The app manages projects, tasks, contacts, invoices, expenses, budgets, meetings, and reports. Use React/TypeScript with Inertia.js, Tailwind CSS, and shadcn/ui components. Target viewport: 320px–428px (small phones to large phones). Optimize for touch, one-handed use, and minimal cognitive load.

---

## Design Principles

1. **Progressive disclosure** — Show only essential info; move secondary details to drill-down screens or expandable sections.
2. **Thumb zone** — Primary actions in bottom 1/3 of screen; navigation reachable with one hand.
3. **Single-column layout** — No multi-column grids on mobile; stack everything vertically.
4. **Touch targets** — Minimum 44×44px for interactive elements; adequate spacing between taps.
5. **Reduce clutter** — Remove or collapse non-critical data; avoid dense tables and long breadcrumbs.

---

## Global Layout (Mobile)

### Header (Sticky, ~56px)
- **Left:** Hamburger menu (opens sidebar/drawer), page title (truncated, max 1 line).
- **Right:** Search icon (optional), notifications bell, profile avatar (opens profile menu).
- **Hidden on mobile:** Full breadcrumbs, workspace name in header, language switcher (move to profile/settings).
- **Workspace switcher:** Accessible from profile menu or sidebar only.

### Navigation
- **Primary:** Bottom tab bar (4–5 items) for: Dashboard, Projects, Tasks, Contacts, More (overflow).
- **Alternative:** Slide-out drawer from left; bottom bar only for Dashboard + More.
- **"More"** opens a full-screen menu with: Invoices, Expenses, Reports, Calendar, Notes, Assets, Meetings, Settings.
- **Collapsible sidebar** on tablet (768px+) only; always drawer on phone.

### Content Area
- Full-width; padding 16px horizontal, 12–16px vertical.
- No fixed sidebars; single scrollable column.
- Pull-to-refresh where appropriate (lists, dashboard).

---

## Page-Specific Design

### Dashboard
**Show:**
- 2–4 primary stat cards (Users, Projects, Tasks, Revenue) — one per row, compact (icon + number + label).
- Single "Quick actions" row: Create Project, Add Task, Submit Expense (icon buttons).
- Recent activities list (5–8 items): icon, description, time; tap to open related entity.
- One primary CTA: e.g. "View Projects" or "View Tasks".

**Hide/Simplify:**
- Budget utilization chart (show only "Spent / Total" text).
- Project status breakdown (Active/Completed/Overdue) — move to Projects page.
- Task stages breakdown — move to Tasks page.
- Invoice status grid — replace with single "X overdue" badge + link.
- Secondary stat cards (e.g. "Plan Orders", "Coupons" for superadmin).
- "System Overview" / "Live Data" badges.

### Projects
**Show:**
- Search + filter (status) as compact chips or dropdown.
- Project cards: name, status badge, progress bar (optional), member avatars (max 3).
- Tap card → project detail.
- FAB or bottom CTA: "New Project".

**Hide:**
- Table view; Gantt chart (offer "View on desktop" or simplified timeline).
- Bulk actions toolbar.
- Advanced filters (date range, client, etc.) — move to filter sheet.

### Tasks
**Show:**
- Tabs or segmented control: All / My Tasks / By Stage.
- Task cards: title, assignee avatar, due date, status/priority.
- Swipe actions: Complete, Edit, Delete (optional).
- FAB: "Add Task".

**Hide:**
- Kanban board (replace with list + status filter).
- Task stages management — move to Settings or "More".
- Bulk select, multi-column sort.

### Contacts (CRM)
**Show:**
- Search bar.
- Contact cards: name, company, email/phone (one line).
- Tap → contact detail (name, contact info, notes, linked projects).
- FAB: "Add Contact".

**Hide:**
- Full contact table with many columns.
- Advanced segmentation filters.

### Invoices
**Show:**
- Status filter: All / Paid / Pending / Overdue.
- Invoice cards: number, client, amount, status, due date.
- Tap → invoice detail (view, pay, download).
- FAB: "Create Invoice".

**Hide:**
- Invoice creation form with many fields — use stepped wizard.
- Invoice templates preview — simple dropdown only.
- Payment settings, tax breakdown in list.

### Expenses
**Show:**
- List of expense entries: amount, category, date, status.
- FAB: "Add Expense".
- Approval actions (Approve/Reject) as clear buttons on each card.

**Hide:**
- Expense report tables.
- Receipt preview in list — show on detail only.
- Multi-level approval workflow UI.

### Reports
**Show:**
- Report type selector (Budget, Project, Task, Purchases).
- Summary: key metric + trend (e.g. "Total: $X, ↑ 12%").
- "View full report" → simplified chart or table.
- Export as secondary action.

**Hide:**
- Complex charts; use simple bar/line or numbers only.
- Date range pickers — use presets (This week, This month).
- Multi-dimensional filters.

### Calendar
**Show:**
- Month view with dots for days with events.
- Day view: list of events (time, title, project).
- Tap event → quick detail.
- FAB: "Add Event" or "Add Task".

**Hide:**
- Week view grid.
- Drag-and-drop.
- Multiple calendar layers.

### Settings
**Show:**
- Grouped list: Profile, Workspace, Notifications, Appearance, Language.
- Each item → simple form or toggle.
- Storage, currency, invoice settings — minimal forms.

**Hide:**
- Brand settings (logo, colors) — desktop only or simplified.
- Sidebar style, layout direction — low priority on mobile.
- Notification templates editor — link to desktop or simplified list.

---

## Components to Adapt

### Tables
- Replace with card-based lists.
- Each row = card with key fields.
- Horizontal scroll only if absolutely necessary; prefer stacking.

### Modals
- Full-screen on mobile (or bottom sheet).
- Max height 90vh; internal scroll.
- Sticky header with close button.

### Forms
- One field per row; large inputs.
- Stepper for long forms (e.g. Create Project, Create Invoice).
- Sticky "Submit" at bottom.

### Filters
- Bottom sheet or slide-over.
- Chips for active filters.
- "Clear all" visible.

### Empty States
- Icon + short message + primary CTA.
- No decorative illustrations on small screens.

---

## Information to Omit on Mobile

| Category | Omit |
|----------|------|
| **Navigation** | Full breadcrumb trail, workspace name in header |
| **Dashboard** | Budget chart, task stages breakdown, invoice status grid, system overview |
| **Lists** | Table columns beyond 2–3, bulk actions, advanced sort |
| **Reports** | Complex charts, multi-filter reports |
| **Settings** | Brand customization, sidebar preview, template editors |
| **Global** | Language switcher in header, repository/docs links |
| **Admin** | Plan orders, coupons, landing page management (superadmin) |

---

## Technical Notes

- Use `min-h-[44px]` or `h-11` for touch targets.
- `touch-manipulation` for buttons to reduce 300ms delay.
- `safe-area-inset` for notched devices.
- Bottom nav: `pb-safe` or `env(safe-area-inset-bottom)`.
- Prefer `sm:` breakpoints for tablet; `md:`/`lg:` for desktop-only features.
- Test on 320px, 375px, 390px, 428px widths.

---

## Summary

Mobile version should prioritize: **view and act**. Users can check status, complete quick actions, and add/update core entities. Advanced configuration, reporting, and admin features stay on desktop or in simplified mobile flows.
1