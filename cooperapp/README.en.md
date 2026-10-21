# CooperApp — Management system for cooperatives and small businesses

🌐 **English** · [Español](README.md)

> **Private code.** CooperApp may become a commercial product, so this page shows what it does and how it is built, without the source code. If you would like a live demo, get in touch.

A web system that lets cooperatives and small businesses run their administration in one place: users and permissions, finances, catalog, stock, services and downloadable reports. Each company sees only its own data and turns on the modules it needs.

**My role:** a team project for my Software Development degree. I was the **lead developer**, with 29 of the 40 commits: database design, back end, front end, QA and UX audits, and organizing the backlog into sprints. I used AI-assisted development throughout.

## Screenshots

> Test data from a fictional company. The interface is in Spanish.

**Dashboard:** monthly indicators, latest transactions and stock alerts.
<img src="capturas/panel-general.png" width="820">

**Reports by period:** period shortcuts, four ways to group, and export to Excel and PDF.
<img src="capturas/reportes.png" width="820">

| Downloaded PDF report | Stock calculated from movements |
|---|---|
| <img src="capturas/reporte-pdf.png" width="400"> | <img src="capturas/stock.png" width="420"> |

| Money movements | Services catalog |
|---|---|
| <img src="capturas/movimientos.png" width="410"> | <img src="capturas/servicios.png" width="410"> |

## What it does

**Multi-tenant platform**
- Companies sign up on their own and stay pending until a superadmin approves them. On approval, their initial configuration is loaded automatically.
- Each company is isolated from the others: its users can neither see nor touch another company's data.
- Modules can be turned on and off per company (finances, products, services, reports). The menu changes according to the active modules, and **the server enforces it too**: typing the URL by hand does not bypass the restriction.

**Roles and permissions**
- 4 roles: superadmin, administrator, treasurer and operator. Each one sees only what they need: the treasurer handles money and the operator handles the warehouse.
- Passwords hashed with bcrypt, temporary passwords that must be changed on first login, user deactivation and reactivation.
- Every request checks the user's real status: if a user is deactivated, they lose access immediately, even with an open session.

**Finances**
- Income and expenses with categories and types. Transactions are never deleted: they are voided, so the history is never lost.
- Summary of income, expenses and balance, recalculated with every filter.
- Each transaction can be linked to the service that generated it, to see how much each service brings in.

**Catalog and stock**
- Products and services with categories and subcategories.
- Stock is not stored in any column: **it is calculated by adding up the movements**, so the history always explains the number on screen.
- Configurable stock reasons (purchase, sale, loss, theft), validated so they cannot contradict their effect on money.
- Concurrency control: if two people sell the same product at the same time, stock never goes negative.

**Reports**
- Reports by period: this month, last month, this year or a custom range.
- Grouped by category, product or service, plus a valued losses report.
- Download as **CSV for Excel** (Argentine separators and decimals) and as paginated **PDF**, with the header repeated on every page.

## Stack

| Layer | Technology |
|---|---|
| Back end | Node.js · Express 5 · express-session |
| Database | MySQL / MariaDB, with parameterized queries and strict mode |
| Security | bcrypt · `httpOnly` and `sameSite` sessions · role and module checks on the server |
| Front end | HTML · CSS · JavaScript |
| Reports | pdfkit (PDF) · custom CSV |

**Architecture:** routes → middlewares (authentication, role and module) → controllers → services → models (SQL). About 6,000 lines of back-end JavaScript.

## How the team worked

- **Sprint-based backlog** with user stories. At the time of this case study it was on Sprint 10.
- **QA and UX audits** at the end of every couple of sprints, with written reports. Each finding became a fix. For example: two simultaneous sales could leave stock negative, or the database silently truncated long texts.
- **Test data** with 4 companies, 27 users and all 4 roles, so anyone on the team could reproduce every case.

---

**Ezequiel Delipetro** · [LinkedIn](https://www.linkedin.com/in/ezedelipetro/) · e.delipetro@gmail.com
