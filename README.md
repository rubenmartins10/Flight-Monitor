# Flight Monitor

A personal flight price monitoring application built with Next.js and Supabase. Users can track flight routes, receive alerts when prices drop below a defined threshold, and view historical price trends.

## Features

- **Route tracking** — Monitor one-way or return flight routes between any two airports using IATA codes
- **Price history** — Stores the top 3 cheapest flights per check with airline, dates, duration, and stops
- **Threshold alerts** — Email notifications via Nodemailer when a price falls below a user-defined threshold
- **Passenger multiplier** — Prices are displayed multiplied by the number of passengers
- **Date-specific searches** — Filter averages within a ±7-day window of the target travel dates
- **Google Flights links** — Direct links to Google Flights for each result
- **Automated checks** — Cron job runs twice daily (09:00 and 18:00 UTC) via Vercel Cron
- **Authentication** — Email/password auth with Supabase, protected routes via Next.js middleware

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2.5 (App Router) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth with `@supabase/ssr` |
| Flight data | SerpAPI (Google Flights) |
| Photos | Pexels API |
| Email | Nodemailer |
| Deployment | Vercel |

## Project Structure

```
app/
  api/
    auth/           # Login, register, logout handlers
    routes/         # GET/POST routes, PUT/DELETE by ID
    prices/check/   # Manual price check endpoint
    photos/         # Destination photo lookup
    cron/           # Scheduled price check
  dashboard/        # Main authenticated page
  login/
  register/
lib/
  serpapi.js        # Google Flights data fetching
  pexels.js         # Destination photo fetching
  email.js          # Alert email sender
  supabase/         # Client and server Supabase instances
supabase/
  schema.sql        # Full schema + migrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A SerpAPI key
- A Pexels API key
- An SMTP email account (e.g. Gmail with App Password)

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>

SERPAPI_KEY=<serpapi_key>
PEXELS_API_KEY=<pexels_key>

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=<your_email>
EMAIL_PASS=<app_password>
EMAIL_FROM=<your_email>

CRON_SECRET=<random_secret>
NEXT_PUBLIC_SITE_URL=https://<your-domain>.vercel.app
```

### Database Setup

Run the contents of `supabase/schema.sql` in the Supabase SQL Editor. If the tables already exist, only the migration lines at the bottom are needed.

### Local Development

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000` by default.

## Deployment

The project is configured for Vercel. The `vercel.json` file defines the cron schedule.

Required steps:
1. Push the repository to GitHub
2. Import the project in Vercel
3. Add all environment variables in the Vercel project settings
4. Deploy

The `CRON_SECRET` environment variable is used to authenticate cron requests. Vercel passes it as a header (`x-cron-secret`) when invoking `/api/cron`.

## Database Schema

### `routes`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | References `auth.users` |
| `from_code` | text | Origin IATA code |
| `to_code` | text | Destination IATA code |
| `label` | text | Display name |
| `notify` | boolean | Email alerts enabled |
| `threshold_eur` | numeric | Alert threshold in EUR |
| `date_from` | text | Target outbound date (YYYY-MM-DD) |
| `date_to` | text | Target return date (YYYY-MM-DD) |
| `passengers` | integer | Number of passengers |

### `price_history`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `route_id` | uuid | References `routes` |
| `price` | numeric | Price in EUR |
| `airline` | text | Airline name |
| `departure_date` | text | Departure date |
| `return_date` | text | Return date |
| `duration_h` | numeric | Total flight duration |
| `stops` | integer | Number of stops |
| `rank` | integer | Position in top 3 (1–3) |
| `check_id` | text | Groups results from the same check |
| `checked_at` | timestamptz | When the check ran |

## Security

- All database tables use Row Level Security (RLS). Users can only read and write their own data.
- API routes verify the authenticated session via Supabase SSR before any operation.
- The cron endpoint requires a `x-cron-secret` header matching the `CRON_SECRET` environment variable.
- Environment variables containing secrets are never exposed to the client.
