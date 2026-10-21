# From copying spreadsheets by hand to an automated load with email alerts

🌐 **English** · [Español](README.md)

**The problem:** every branch sends its sales spreadsheet every day. Someone in the back office opens each one, copies the rows into a master spreadsheet or the system, and fixes whatever they find: dates written a dozen different ways, amounts with "$" and dots, product codes that don't exist, duplicated sales. It takes time every single day, and the errors that slip through show up later in the reports.

**The solution:** a process that runs on its own every 15 minutes. It picks up the new spreadsheets, cleans and validates every row, loads the valid ones into the database, sets aside the ones with errors along with the reason, and emails a summary of how it went.

<p align="center"><img src="capturas/mail-resumen.png" width="560" alt="Summary email of the load"></p>

*(The demo data and the email are in Spanish, as the target users are Spanish-speaking businesses.)*

## What it does

```
entrada/ (inbox)          proceso.py                          database
ventas_centro.xlsx  ─┐    1. Reads each spreadsheet          ┌─► ventas (114 rows)
ventas_norte.xlsx   ─┼─►  2. Recognizes the headers          │
ventas_oeste.xlsx   ─┘    3. Cleans and validates each row ──┼─► rejects.csv (7 rows, with the reason)
                          4. Loads the whole file at once    │
                          5. Moves it to procesados/         └─► summary email
```

- **Understands each spreadsheet even if it is laid out differently.** One branch writes "Nro venta" and another "N° de venta"; one "Cantidad" and another "Cant.". The process recognizes each column without anyone changing the way they work.
- **Cleans what can be cleaned:** dates as text or in other formats (`20/10/2026`, `2026-10-20`, `20-10-26`), amounts with a currency sign and Argentine number format (`$ 4.200,00`), codes in lowercase or with spaces.
- **Rejects what cannot be guessed, and says why:** a product that is not in the catalog, a negative quantity or one written in words, a date like "yesterday", a sale with no number or a duplicated one. Those rows go to a CSV that opens in Excel, with the file, the row number and the reason, so they can be fixed at the source.
- **Never loads anything twice.** Each sale's number is the key, and each file is registered by a fingerprint of its content: if the same spreadsheet arrives again, it is reported and not loaded.
- **All or nothing per file.** If something fails halfway through a spreadsheet, that file is not left half-loaded. And one broken file doesn't stop the others.
- **Sends an email** with the total loaded, the breakdown by branch, the most frequent errors and the rejects CSV attached. The subject line already says whether there is something to review.
- **Keeps a log** of every run in `salida/proceso.log`.

## Result with the sample files

Three spreadsheets with 40 sales each, with 15 problems planted on purpose:

| Branch | Loaded | Rejected | Fixed automatically |
|---|---:|---:|---|
| Centro | 38 | 3 (unknown product, negative quantity, duplicated sale) | date as text, amount "$ 4.200,00", empty row |
| Norte | 38 | 2 (date "yesterday", missing code) | different date format, code " a101 ", decimal point |
| Oeste | 38 | 2 (quantity "two", missing sale number) | two-digit year, amount "1.900" |

Sample rejects file: [ejemplo-rechazos.csv](capturas/ejemplo-rechazos.csv).

## Files

| File | What it does |
|---|---|
| [proceso.py](proceso.py) | The main process: finds new files, loads, sets aside rejects, moves files and sends the alert. |
| [validaciones.py](validaciones.py) | The cleaning and validation rules for each column. |
| [aviso.py](aviso.py) | Builds the HTML email and sends it over SMTP. Without a configured server, it saves it to `salida/mails/`. |
| [esquema.sql](esquema.sql) | The tables: products, sales and a registry of processed files. |
| [test_validaciones.py](test_validaciones.py) | Automated tests for the cleaning rules. |
| [generar_ejemplos.py](generar_ejemplos.py) | Creates the three sample spreadsheets with typical errors. |

## Try it

Requirements: Python 3 and `openpyxl` (`pip install openpyxl`).

```bash
python generar_ejemplos.py   # creates entrada/ with 3 spreadsheets and the catalog
python proceso.py            # loads, sets aside rejects and writes the email to salida/mails/
python -m unittest           # runs the tests
```

To send real emails, copy `.env.example` to `.env` and fill in the SMTP server details (Gmail, Outlook or the company's own).

## Running it unattended

**Windows** (Task Scheduler), every 15 minutes:

```bash
schtasks /create /tn "Sales load" /sc minute /mo 15 /tr "python C:\carga-excel\proceso.py"
```

**Linux** (cron): `*/15 * * * * cd /opt/carga-excel && python3 proceso.py`

If there are no new files, the process finishes in a second without doing anything.

## Adapting it

The database is SQLite so the example runs without installing anything. In a real company it connects to their own database (MySQL, SQL Server, PostgreSQL) by changing only the connection. The same pieces work for stock, payments, attendance or order spreadsheets: the columns and rules change, the rest of the process stays the same. Files can also arrive by email, through a shared folder or from an API instead of a local folder.

---

Is your team losing hours moving data from one place to another? I automate that. **e.delipetro@gmail.com** · [LinkedIn](https://www.linkedin.com/in/ezedelipetro/) · [Website](https://ezedeli.github.io/Proyectos/en.html)
