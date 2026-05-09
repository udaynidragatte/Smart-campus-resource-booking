# CampusBook Backend

Express + MySQL + JWT backend for the Smart Campus Resource Booking System.

## Setup

1. Create a MySQL database and tables:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

2. Create `.env` from `.env.example` and update MySQL credentials:

```bash
copy .env.example .env
```

3. Install and run:

```bash
npm install
npm run dev
```

API runs on `http://localhost:5000`.

## Demo Accounts

Seed file includes demo accounts for:

- `student@campusbook.edu`
- `faculty@campusbook.edu`
- `admin@campusbook.edu`

For reliable local login, you can also register these accounts through `POST /api/auth/register`.

## Main Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Resources

- `GET /api/resources`
- `GET /api/resources/summary`
- `POST /api/resources` admin
- `PUT /api/resources/:id` admin
- `DELETE /api/resources/:id` admin

### Bookings

- `GET /api/bookings`
- `POST /api/bookings/check`
- `POST /api/bookings`
- `PATCH /api/bookings/:id/status` admin
- `DELETE /api/bookings/:id`

### Analytics

- `GET /api/analytics/overview` admin

### Check-ins

- `POST /api/checkins/verify`
- `POST /api/checkins`
- `PATCH /api/checkins/:id/checkout`

### Campus Services

- `GET /api/campus/principal` - check whether the principal is present on campus
- `PATCH /api/campus/principal` admin - update principal campus presence, location, and appointment window
- `GET /api/campus/buses` - list college buses with latest GPS location, ETA, route, stops, and status
- `POST /api/campus/buses/:id/location` admin/faculty - update bus GPS coordinates and route status