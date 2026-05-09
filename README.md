# Smart Campus Resource Booking System

Hackathon-ready React + Vite + Tailwind interface with an Express + MySQL backend for booking and managing campus resources.

## Interface included

- Landing page with campus-themed hero and CTA
- JWT-style login/register screens with role selection
- Student/faculty dashboard with stats, bookings, search, and resources
- Resource listing and details page
- Booking workflow with conflict warning and alternative slot suggestions
- My bookings page with QR code generation for approved bookings
- Admin dashboard, resource management, booking approvals, analytics
- QR check-in verification screen

## Database integration

The app now talks to the Express API in `backend/`.

- Login/register uses `POST /api/auth/login` and `POST /api/auth/register`
- Resources load from `GET /api/resources`
- Bookings load from `GET /api/bookings` after login
- Booking requests save through `POST /api/bookings`
- Principal and bus pages read from the campus service endpoints
- Mock data remains as a fallback while MySQL or the backend is offline

## Run locally

```bash
npm install
npm run dev
```

Create frontend env:

```bash
copy .env.example .env
```

## Backend API

Run the API in a second terminal:

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Load MySQL schema:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Demo accounts from the seed file:

- `student@campusbook.edu` / `student123`
- `faculty@campusbook.edu` / `faculty123`
- `admin@campusbook.edu` / `admin123`
