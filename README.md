# Expense Tracker – Full Stack Web Application

A web-based expense tracking application built with React and Django. Users can securely manage income and expenses, set budgets, and visualize their financial data through charts and reports.

---

## Features

- User registration and JWT authentication
- Email verification with OTP
- Add, edit, and delete income and expenses
- Budget tracking per category with performance indicators
- Upload expenses in bulk via CSV
- Visual insights through Pie, Bar, Line, and Radar charts
- Admin panel access for management
- Dark mode toggle for improved UX
- Responsive dashboard layout with dialog-based forms
- Swagger and ReDoc for API documentation

---

## Tech Stack

| Layer        | Technologies                              |
|--------------|-------------------------------------------|
| Frontend     | React, TypeScript, React Hook Form, MUI   |
| Backend      | Django, Django REST Framework             |
| Database     | PostgreSQL                                |
| Charting     | Recharts                                  |
| Auth         | JWT (SimpleJWT), OTP via email            |
| Docs         | Swagger (drf-yasg), ReDoc                 |

---

## Project Structure

```
Expense_Tracker/
├── backend/
│   ├── users/
│   ├── expenses/
│   ├── incomes/
│   ├── categories/
│   ├── budgets/
│   └── notifications/
├── frontend/
│   ├── src/components/
│   └── App.tsx
├── .env
├── README.md
```

---

## Backend Installation

### Prerequisites
- Python 3.10+
- pip
- PostgreSQL

### Steps

```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker/backend
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file and configure:

```
SECRET_KEY=your_secret
DEBUG=True
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-digit-app-password
DEFAULT_FROM_EMAIL=noreply@expensetracker.com
```

Run migrations and start server:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

---

## Frontend Installation

### Prerequisites
- Node.js 18+
- npm

### Steps

```bash
cd ../frontend
npm install
npm run dev
```

Accessible at `http://localhost:5173`

---

## Usage Instructions

1. Register via `/register`
2. Verify email via `/verify-email`
3. Login at `/`
4. Access `/dashboard` for:
   - Adding income and expenses
   - Budget setup
   - CSV upload
   - Viewing analytics and visual insights

---

## Budget and Analytics

- Track budgets by category and month
- Visual indicators: green (within), yellow (near limit), red (over)
- View performance summaries and analytics
- Charts: Pie, Bar, Radar, Line via Recharts

---

## Bulk Upload

Format:
```
title,amount,date,category,notes
Electricity,2000,2025-04-01,Utilities,Bill
```

Upload endpoint:
```
POST /api/expenses/upload/bulk/
```

---

## API Documentation

- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc UI: `http://localhost:8000/redoc/`
- Schema: `http://localhost:8000/swagger.json`

---

## Admin Panel

- Admin dashboard: `http://localhost:8000/admin-expense/`
- Use Django superuser credentials to log in

---

## Security Notes

- JWT authentication via SimpleJWT
- Token blacklist on logout
- Input validation with Zod and DRF serializers
- Admin route renamed for added obscurity

---

## Developer Notes

- Configure `.env` for local/production
- Celery and Redis are recommended for production email and background tasks

---
