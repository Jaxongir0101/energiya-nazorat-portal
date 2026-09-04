# Energetika Nazorati

E-ENERGIYA NAZORAT — Elektr energiyasi qarzdorliklarini undirish monitoring platformasi

Create a complete, modern, production-quality responsive WEB ADMIN DASHBOARD called “E-Energiya Nazorat” for monitoring the collection of electricity debts from companies in Jizzakh Region, Uzbekistan.

The application language must be Uzbek (Latin).

The system will monitor debt collection across 12 districts and Jizzakh city (13 territories total). Each territory has 2 responsible employees, approximately 26 employees in total.

The main purpose of the system is for management to see, in real time, how much electricity debt exists, how much has been collected today, how much has been collected since the beginning of the campaign, which employees are performing well, and detailed information about every debtor company.

1. DESIGN SYSTEM

Create a premium government/enterprise analytics dashboard.

Design style:

Modern

Minimal

Professional

Clean

Data-focused

Government/enterprise quality

Responsive desktop/tablet/mobile layout

Light theme by default

Excellent typography

Soft shadows

Rounded cards

Clear spacing

Professional icons

Smooth hover effects and transitions

Use a collapsible left sidebar and top navigation.

The dashboard must NOT look like a generic template. It should feel like a real professional debt monitoring and management system.

Use Uzbek so‘m formatting:

1 250 000 000 so‘m

For large dashboard numbers use:

1,25 mlrd so‘m
850 mln so‘m

2. SIDEBAR

Create the following navigation:

Dashboard

Qarzdorlar

Hududlar

Mas’ullar

Undirishlar

Hisobotlar

Foydalanuvchilar

Sozlamalar

Bottom:

Profil

Chiqish

Sidebar should be collapsible.

3. USER ROLES

Create three roles:

Super Admin

Can see and manage everything.

Nazoratchi

Can see all territories, employees, companies, collections and reports but has limited administrative editing permissions.

Mas’ul xodim

Can only see companies assigned to them and can enter collection/payment information for those companies.

4. DASHBOARD

Create a powerful management dashboard.

At the top show:

“Elektr energiyasi qarzdorliklari monitoringi”

Below it show current date and a global filter button.

Global filters:

Sana oralig‘i

Hudud

Mas’ul

Qarzdorlik turi

Quick date filters:

Bugun

Kecha

Oxirgi 7 kun

Joriy oy

Tadbir boshidan

Ixtiyoriy davr

All dashboard statistics and charts must react to filters.

5. MAIN KPI CARDS

Create clickable KPI cards.

Jami qarzdorlik

Example:
128,4 mlrd so‘m

Show small secondary information:
1 284 ta qarzdor korxona

Umidsiz qarzdorlik

Example:
47,2 mlrd so‘m

Harakatdagi qarzdorlik

Example:
81,2 mlrd so‘m

Bugun undirildi

Example:
1,24 mlrd so‘m

Show percentage change compared with yesterday.

Tadbir boshidan beri undirildi

Example:
18,7 mlrd so‘m

Qolgan qarzdorlik

Example:
109,7 mlrd so‘m

Every KPI card MUST be clickable.

Examples:

Jami qarzdorlik → open all debtors.

Umidsiz qarzdorlik → open debtors filtered by “Umidsiz”.

Harakatdagi qarzdorlik → open debtors filtered by “Harakatdagi”.

Bugun undirildi → open today’s collections.

Tadbir boshidan beri undirildi → open all campaign collections.

6. MAS’ULLAR KESIMIDA CHART

Below KPI cards create a large interactive bar chart:

“Mas’ullar kesimida undirish natijalari”

Show responsible employees and collected amount.

Allow switching between:

Bugun

Hafta

Oy

Tadbir boshidan

Example:

A. Aliyev — 1,2 mlrd
B. Karimov — 980 mln
J. Xasanov — 860 mln
D. Ergashev — 750 mln

Each bar must be clickable.

Clicking an employee opens:

/employees/:id

Add sorting:

Eng ko‘p undirgan

Eng kam undirgan

Hudud bo‘yicha

7. HUDUDLAR KESIMIDA

Create another analytics section:

“Hududlar kesimida”

Use both a chart and compact table.

Columns:

Hudud

Boshlang‘ich qarzdorlik

Undirilgan

Qoldiq

Samaradorlik %

Use all 13 territories:

Jizzax shahri

Arnasoy

Baxmal

Do‘stlik

Forish

G‘allaorol

Mirzacho‘l

Paxtakor

Sharof Rashidov

Yangiobod

Zafarobod

Zarbdor

Zomin

Each territory must be clickable.

Click → /territories/:id

8. TERRITORY DETAILS PAGE

Create a detailed page for each territory.

Header example:

Zomin tumani

Show KPI cards:

Jami qarzdorlik

Umidsiz

Harakatdagi

Bugun undirildi

Tadbir boshidan undirildi

Qoldiq

Show the 2 responsible employees assigned to the territory.

Employee cards should show:

F.I.Sh.

Telefon

Biriktirilgan korxonalar

Jami qarzdorlik

Bugun undirildi

Jami undirildi

Qoldiq

Samaradorlik %

Below show all debtor companies in that territory.

9. QARZDORLAR PAGE

Create a professional data table.

Columns:

№

Korxona nomi

STIR

Hudud

Mas’ul

Qarzdorlik turi

Boshlang‘ich qarzdorlik

Undirilgan

Qoldiq

Samaradorlik

Oxirgi to‘lov

Holati

Amallar

Filters:

Search by company name

STIR

Hudud

Mas’ul

Qarzdorlik turi

Holati

Qarzdorlik summasi

Sana

Debt types:

Umidsiz

Harakatdagi

Statuses:

Undirilmoqda

Qisman undirildi

To‘liq undirildi

O‘zgarishsiz

Use badges for status and debt types.

Clicking company name or row opens:

/debtors/:id

10. DEBTOR COMPANY DETAILS

Create a complete company profile.

Header:

ABC TEXTILE MCHJ

Information:

STIR

Hudud

Manzil

Rahbar F.I.Sh.

Telefon

Mas’ul xodim

Qarzdorlik turi

Holati

Financial cards:

Boshlang‘ich qarzdorlik

Jami undirilgan

Qoldiq

Undirish foizi

Example:

Boshlang‘ich:
850 000 000 so‘m

Undirilgan:
320 000 000 so‘m

Qoldiq:
530 000 000 so‘m

Samaradorlik:
37,6%

Add a progress bar.

11. UNDIRISH TARIXI

Inside company details show:

“Undirish tarixi”

Table:

| Sana | Summa | Mas’ul | To‘lov turi | Izoh | Hujjat |

Allow uploaded supporting documents:

PDF

JPG

PNG

Each payment/collection must have its own record.

Never simply overwrite collected totals.

The system should calculate totals from collection records.

12. UNDIRISH QO‘SHISH

Responsible employee can click:

“+ Undirish qo‘shish”

Open modal/drawer.

Fields:

Korxona

Undirilgan summa

Sana

To‘lov turi

Izoh

Tasdiqlovchi hujjat

Mas’ul

Buttons:

Bekor qilish

Saqlash

After saving, automatically update:

Company collected amount

Company remaining debt

Employee statistics

Territory statistics

Dashboard statistics

Reports

Show success toast:

“Undirish ma’lumoti muvaffaqiyatli saqlandi.”

13. MAS’ULLAR PAGE

Create employee performance page.

Table columns:

№

F.I.Sh.

Hudud

Telefon

Biriktirilgan korxonalar

Jami qarzdorlik

Bugun undirildi

Tadbir boshidan undirildi

Qoldiq

Samaradorlik %

Allow sorting by performance.

Create TOP performers section.

Example:

🥇 A. Aliyev — 1,2 mlrd
🥈 B. Karimov — 980 mln
🥉 J. Xasanov — 860 mln

Do not make the interface playful; keep ranking visually professional.

14. EMPLOYEE DETAILS

Route:

/employees/:id

Show:

F.I.Sh.

Hudud

Telefon

Lavozim

Biriktirilgan kompaniyalar soni

KPI:

Jami biriktirilgan qarzdorlik

Umidsiz

Harakatdagi

Bugun undirildi

Tadbir boshidan undirildi

Qoldiq

Samaradorlik %

Add collection performance chart.

Below show:

Biriktirilgan qarzdor korxonalar

and

Oxirgi undirishlar

15. UNDIRISHLAR PAGE

Create centralized collection/payment history.

Columns:

№

Sana va vaqt

Korxona

STIR

Hudud

Mas’ul

Qarzdorlik turi

Undirilgan summa

Izoh

Hujjat

Filters:

Sana oralig‘i

Hudud

Mas’ul

Korxona

Qarzdorlik turi

Summa oralig‘i

At the top show:

Tanlangan davrda undirildi: 4,8 mlrd so‘m

16. HISOBOTLAR — VERY IMPORTANT

Create a powerful dedicated “Hisobotlar” module.

Management must be able to generate reports using filters and download the results as tables.

Report types:

1. Umumiy qarzdorlik hisoboti

Contains:

Korxona

STIR

Hudud

Mas’ul

Qarzdorlik turi

Boshlang‘ich qarzdorlik

Undirilgan

Qoldiq

Samaradorlik %

2. Undirishlar hisoboti

Contains:

Sana

Korxona

STIR

Hudud

Mas’ul

Undirilgan summa

Qarzdorlik turi

Izoh

3. Hududlar kesimida hisobot

Contains:

Hudud

Korxonalar soni

Jami qarzdorlik

Umidsiz

Harakatdagi

Bugun undirildi

Tanlangan davrda undirildi

Tadbir boshidan undirildi

Qoldiq

Samaradorlik %

4. Mas’ullar kesimida hisobot

Contains:

Mas’ul

Hudud

Korxonalar soni

Biriktirilgan qarzdorlik

Bugun undirildi

Tanlangan davrda undirildi

Tadbir boshidan undirildi

Qoldiq

Samaradorlik %

5. Umidsiz qarzdorlik hisoboti

6. Harakatdagi qarzdorlik hisoboti

7. Kunlik undirish hisoboti

17. REPORT FILTERS

Reports must support:

Boshlanish sanasi

Tugash sanasi

Hudud

Mas’ul

Korxona

STIR

Qarzdorlik turi

Holati

Buttons:

Filtrlash

Tozalash

Hisobotni shakllantirish

The generated report must appear as a professional table directly on the page before download.

18. REPORT DOWNLOAD / EXPORT

THIS FUNCTION IS REQUIRED.

Every report and important data table must have:

Excel yuklab olish (.xlsx)

CSV yuklab olish (.csv)

PDF yuklab olish (.pdf)

Chop etish

Export ONLY the currently filtered dataset.

For example:

If user selects:

Hudud = Zomin
Mas’ul = A. Aliyev
Date = 01.09.2026 – 04.09.2026

then downloaded Excel/PDF must contain only those filtered results.

Excel exports must have clear column headers and numeric values formatted correctly.

PDF reports must have:

Elektr energiyasi qarzdorliklarini undirish bo‘yicha HISOBOT

Then show:

Hisobot davri
Hudud
Mas’ul
Hisobot shakllantirilgan sana

Below it show the complete table.

At the bottom show totals:

Jami qarzdorlik

Jami undirildi

Jami qoldiq

Add page numbering for multi-page PDF reports.

19. QUICK EXPORT

Add an “Eksport” button to these pages:

Qarzdorlar

Hududlar

Mas’ullar

Undirishlar

Hisobotlar

Clicking it opens dropdown:

Excel

CSV

PDF

Chop etish

Again, exports must respect currently active filters.

20. REPORT SUMMARY

Above each generated report show summary cards.

Example:

Korxonalar
284 ta

Jami qarzdorlik
38,7 mlrd

Undirildi
8,4 mlrd

Qoldiq
30,3 mlrd

Samaradorlik
21,7%

21. RECENT ACTIVITY

Dashboard should contain:

“So‘nggi undirishlar”

Example:

ABC TEXTILE MCHJ
+25 000 000 so‘m
A. Aliyev
5 daqiqa oldin

XYZ MCHJ
+18 000 000 so‘m
B. Karimov
12 daqiqa oldin

Clicking activity opens company details.

22. SEARCH

Create global search in top navigation.

Search by:

Korxona nomi

STIR

Mas’ul

Hudud

Search results should open relevant detail pages.

23. NOTIFICATIONS

Create notification center.

Examples:

Yangi undirish kiritildi

Qarzdorlik to‘liq undirildi

Yangi korxona biriktirildi

Ma’lumot o‘zgartirildi

24. AUDIT LOG

Create an audit/history system.

Admin should be able to see:

Who entered data

Who edited data

What was changed

Previous value

New value

Date/time

This is important because financial information must not be silently changed.

25. DATABASE STRUCTURE

Prepare the app architecture for Supabase.

Create entities/tables approximately:

users

id

full_name

phone

email

role

territory_id

status

created_at

territories

id

name

type

companies

id

name

stir

director_name

phone

address

territory_id

responsible_employee_id

debt_type

initial_debt

status

created_at

updated_at

collections

id

company_id

employee_id

amount

collection_date

payment_type

comment

document_url

created_at

created_by

assignments

id

company_id

employee_id

assigned_at

audit_logs

id

user_id

action

entity_type

entity_id

old_data

new_data

created_at

Use relational data properly.

Do not duplicate calculated financial totals unnecessarily.

Calculate:

collected_amount = SUM(collections.amount)

remaining_debt = initial_debt - collected_amount

collection_percentage = collected_amount / initial_debt * 100

Prevent remaining debt from becoming negative.

26. DEMO DATA

Populate the prototype with realistic Uzbek demo data.

Create all 13 territories.

Create 2 responsible employees for each territory.

Create at least 50 sample debtor companies distributed between territories.

Use realistic Uzbek company names and employee names.

Use realistic amounts such as:

125 000 000
480 000 000
1 250 000 000

Include both:

Umidsiz

Harakatdagi

debts.

Include multiple collection/payment records so charts and reports contain realistic data.

27. RESPONSIVE TABLES

All large tables must support:

Pagination

Sorting

Filtering

Search

Column visibility

Sticky table header

Horizontal scroll on small screens

Rows per page: 10 / 25 / 50 / 100

Show:

1–25 / 284

28. CLICKABLE DRILL-DOWN EXPERIENCE

The application must have a strong drill-down experience.

Dashboard KPI
→ filtered list

Chart
→ employee/territory

Employee
→ assigned companies

Territory
→ responsible employees + companies

Company
→ debt + collection history

Collection
→ related company

All pages should include breadcrumbs.

Example:

Dashboard / Zomin tumani / ABC TEXTILE MCHJ

29. IMPORTANT BUSINESS LOGIC

Initial debt must never change when a collection is added.

Example:

Initial debt:
850 000 000

Collection 1:
100 000 000

Collection 2:
50 000 000

Collection 3:
25 000 000

System calculates:

Collected:
175 000 000

Remaining:
675 000 000

Never replace the original debt amount with remaining debt.

All Dashboard, territory, employee and report totals must be derived consistently from the same source data.

30. FINAL EXPECTATION

Build this as a realistic working application prototype, not just static UI screens.

Prioritize:

Dashboard analytics

Accurate financial calculations

Clickable drill-down navigation

Territory monitoring

Employee performance monitoring

Company debt tracking

Collection history

Advanced filtering

Professional report generation

Excel / CSV / PDF export

Print-friendly reports

Role-based access

Audit history

Responsive professional UI

All UI text must be in Uzbek Latin.

The application should immediately feel like a system that regional management can open on a large monitor and understand:

qancha qarzdorlik mavjud;

qancha undirildi;

qancha qoldi;

bugun qancha undirildi;

qaysi hudud yaxshi ishlayapti;

qaysi mas’ul yaxshi ishlayapti;

qaysi korxonalarda qarzdorlik saqlanib qolmoqda.

Make the dashboard visually impressive but keep it serious, clean, fast and suitable for official use.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://energiya-nazorat-portal.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b072eedd-451b-453c-948d-4e1e9d1f1efe).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
