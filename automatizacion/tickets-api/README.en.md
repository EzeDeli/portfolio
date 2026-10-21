# Automatic tickets through an API: from "someone has to notice" to an alert that arrives on its own

🌐 **English** · [Español](README.md)

**The problem:** when stock runs low, an order is delayed or a customer complaint comes in, someone has to notice, open a ticket in the help desk and tell the right department. If that person is busy, the alert arrives late, or never.

**The solution:** the database detects the events by itself, and a process turns them into tickets by calling the help desk system's API, with an email to the person in charge. **The existing system is not modified**: it only gets a few triggers.

<p align="center"><img src="capturas/mail-ticket.png" width="520" alt="Email with the automatically created ticket"></p>

*(The demo data and emails are in Spanish, as the target users are Spanish-speaking businesses.)*

## How it works

```
 Existing system              Database                        worker.py                        Help desk
 (untouched)                                                                                   (REST API)
 sells, ships,      ──►   tables ──► TRIGGERS ──► events  ──► reads pending ──► POST /tickets ──► ticket #1005
 logs complaints                     (detect)     (outbox)    retries on failure                       │
                                                       ▲      stores the ticket number ◄───────────────┘
                                                       └───── and emails the responsible department
```

1. **Triggers detect the events** in the database itself: a product crossing its minimum stock, an order switching to delayed, a new complaint. They write them to an events table (the *outbox* pattern). They only fire when needed: if stock was already low and one more unit is sold, the alert is not repeated.
2. **The worker** reads the pending events, builds the ticket with the priority and department for each type, and creates it through the API.
3. **It stores the ticket number** on the event and **sends an email** to the person in charge (Purchasing, Logistics or Customer Service).

## What makes it reliable

Connecting two systems is easy when everything works. What matters is what happens when something fails:

| Situation | What it does |
|---|---|
| The API returns a 503 or 429 error | Retries up to 3 times with exponential backoff (0.5 s, 1 s, 2 s). |
| The API is down | The event is marked as failed with the reason and retried on the next run (up to 5 times). Nothing is lost. |
| The connection drops right after the ticket is created | Each request carries an `Idempotency-Key`: on retry, the API returns the same ticket instead of creating a new one. |
| The worker runs twice | It only processes pending events. No duplicate tickets or emails. |
| The request itself is wrong (4xx), e.g. an event type with no owner | It does not retry pointlessly: it flags it for review, with the reason. |
| Invalid token | The API rejects it (401) and the worker reports it without retrying. |

## The demo

`python demo.py` runs everything with no setup: it starts a simulated help desk that **fails 1 out of 3 requests**, simulates a working day, runs the worker, takes the API down on purpose and brings it back up. Condensed output:

```
== 3. Worker runs
  WARNING HTTP 503: Service unavailable (attempt 1). Retrying in 0.2 s
  INFO    Event 1 -> ticket #1001 (Purchasing)
  ...
   #  type            status    attempts  ticket
   1  stock_bajo      enviado          1  #1001
   2  stock_bajo      enviado          1  #1002
   3  stock_bajo      enviado          1  #1003
   4  pedido_demorado enviado          1  #1004
   5  reclamo         enviado          1  #1005

== 4. Runs again: nothing new, nothing duplicated
  Tickets created in this run: 0. Tickets in the help desk: 5

== 5. The API goes down and a new complaint comes in
   6  reclamo         error            1  -

== 6. The API is back: the pending event is sent on the next run
   6  reclamo         enviado          2  #1006
```

The full output (in Spanish) is in [capturas/salida-demo.txt](capturas/salida-demo.txt).

## Files

| File | What it does |
|---|---|
| [esquema.sql](esquema.sql) | Tables and the three triggers that detect events. |
| [worker.py](worker.py) | Reads events, creates tickets through the API with retries and idempotency, and sends alerts. |
| [aviso.py](aviso.py) | Builds the HTML email and sends it over SMTP (or saves it to `salida/mails/` in demo mode). |
| [mesa_de_ayuda.py](mesa_de_ayuda.py) | Simulated REST API of a ticketing system: token, validation, random failures and `Idempotency-Key`. |
| [simular.py](simular.py) | Creates the database and simulates a working day of the existing system. |
| [demo.py](demo.py) | End-to-end demo, with the API failing and going down. |
| [test_integracion.py](test_integracion.py) | 8 tests: triggers, tickets, duplicates, retries, API down, 4xx errors and token. |

It only uses the Python standard library: nothing to install.

```bash
python demo.py               # the full demo
python -m unittest           # the tests
python mesa_de_ayuda.py      # the API alone, at http://127.0.0.1:8765/api/v1/tickets
python worker.py --cada 60   # the worker checking every 60 seconds
```

## Taking it to a real system

- **The help desk:** set `API_URL` and `API_TOKEN` to the company's ticketing system and adapt `armar_ticket()` to the fields its API expects.
- **The database:** the triggers are written the same way in MySQL, SQL Server or PostgreSQL. If triggers can't be added, the worker can query the tables directly every few minutes.
- **The alerts:** with the SMTP settings in environment variables, emails go out for real. Other channels (Teams, Slack, WhatsApp) can be added the same way.
- **Running unattended:** Windows Task Scheduler, cron or a service.

---

Does your company rely on alerts that depend on "someone remembering"? I automate that. **e.delipetro@gmail.com** · [LinkedIn](https://www.linkedin.com/in/ezedelipetro/) · [Website](https://ezedeli.github.io/Proyectos/en.html)
