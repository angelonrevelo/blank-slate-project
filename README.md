# VBE Eye Center (Lovable-Connected Mirror)

> **Note:** This repository (`blank-slate-project`) is now a Lovable-connected mirror of the [vbeeyecenter](https://github.com/CelestialBrain/vbeeyecenter) codebase. It serves as the GitHub endpoint that Lovable uses for this project.

A modern healthcare management application for VBE Eye Center, built with React, TypeScript, and Tailwind CSS. This is a complete refactoring of the FlutterFlow application to the React/JavaScript ecosystem.

## Features

- **Authentication**: Secure login with email/password, password reset functionality
- **Dashboard**: Overview of patient statistics and quick actions
- **Patient Management**: Search, add, and manage patient records
- **Scheduling**: Appointment scheduling and calendar management
- **Surgery Tracking**: Track surgical procedures and their status
- **Account Management**: User profile, signature upload, and password change
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router 7** - Client-side Routing
- **Tailwind CSS** - Utility-first CSS
- **Supabase** - Backend as a Service (Auth, Database, Storage)
- **Vitest** - Unit Testing

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Modal, etc.)
│   ├── Layout.tsx      # Main app layout with sidebar
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── ProtectedRoute.tsx  # Auth route wrapper
├── context/            # React Context providers
│   ├── AuthContext.tsx # Authentication state management
│   └── AppContext.tsx  # Application state management
├── lib/                # Utility libraries
│   └── supabase.ts     # Supabase client configuration
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── LoadingPage.tsx
│   ├── DashboardPage.tsx
│   ├── AccountPage.tsx
│   ├── PatientsPage.tsx
│   ├── MyTasksPage.tsx
│   ├── InformationPage.tsx
│   ├── ReturningPage.tsx
│   ├── SchedulingPage.tsx
│   └── SurgeryPage.tsx
├── types/              # TypeScript type definitions
├── test/               # Test setup and utilities
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles with Tailwind
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CelestialBrain/blank-slate-project.git
cd blank-slate-project
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Pages & Routes

| Route | Page | Auth Required | Description |
|-------|------|---------------|-------------|
| `/` | Loading | No | Initial loading/redirect |
| `/login` | Login | No | User authentication |
| `/dashboard` | Dashboard | Yes | Main overview page |
| `/patients` | Patients | Yes | Patient management |
| `/my-tasks` | My Tasks | Yes | Task list and intake |
| `/information` | Information | Yes | Patient details form |
| `/returning` | Returning | Yes | Follow-up patients |
| `/scheduling` | Scheduling | Yes | Appointment scheduling |
| `/surgery` | Surgery | Yes | Surgery schedule |
| `/account` | Account | Yes | User profile settings |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Lovable Integration

This repository is connected to Lovable for visual development. Any changes made through Lovable will be reflected here, and vice versa.

### Syncing with vbeeyecenter

This repository mirrors the `vbeeyecenter` codebase. To sync changes:
1. Changes made in Lovable are pushed to this repository
2. The source of truth for application logic is `CelestialBrain/vbeeyecenter`
3. Updates from `vbeeyecenter` should be merged via pull requests

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run linting and tests
4. Submit a pull request

## SMS Scheduler

The SMS Scheduler runs as a Lovable Cloud Edge Function triggered by a cron job to send SMS messages to customers.

### What It Does

- Queries `sms_schedules` for due messages (status = 'scheduled', is_active = true, next_run_at <= now)
- Sends messages via [Semaphore SMS API](https://semaphore.co)
- Writes delivery logs into `sms_logs`
- Updates `sms_schedules` status, retries, and `next_run_at` (supporting one-time and recurring schedules)

### Setup

1. **Add SEMAPHORE_API_KEY Secret**
   - Go to Lovable Cloud backend → Secrets
   - Add secret: `SEMAPHORE_API_KEY` with your API key from https://semaphore.co

2. **Configure Cron Job**
   - Enable `pg_cron` and `pg_net` extensions in Lovable Cloud backend
   - Run this SQL to create the cron job:

```sql
select cron.schedule(
  'sms-scheduler-every-5-minutes',
  '*/5 * * * *', -- Every 5 minutes
  $$
  select
    net.http_post(
        url:='https://ybfnrvfcugqqwxwsnbdf.supabase.co/functions/v1/sms-scheduler',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZm5ydmZjdWdxcXd4d3NuYmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxODk0NDIsImV4cCI6MjA3OTc2NTQ0Mn0.OLawBB2NeejcX26MlPjrhs4HfUfTknQ3LENQwfF6AE0"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### Environment Variables

| Variable | Auto-Configured | Description |
|----------|-----------------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (admin access) |
| `SEMAPHORE_API_KEY` | **No** - Add via Secrets | Semaphore SMS API key |
| `SEMAPHORE_SENDER_NAME` | Optional | Sender name for SMS messages (default: "SEMAPHORE") |
| `SCHEDULER_BATCH_SIZE` | Optional | Maximum number of schedules to process per run (default: 20) |

### Frontend Usage

Use `src/lib/smsSchedulerClient.ts` to manage SMS schedules from your app:

```typescript
import { createCustomer, createSmsSchedule } from '@/lib/smsSchedulerClient';

// Create a customer
const customer = await createCustomer({
  name: 'John Doe',
  phoneNumber: '+639171234567',
  timezone: 'Asia/Manila'
});

// Schedule a one-time SMS
const schedule = await createSmsSchedule({
  customerId: customer.id,
  message: 'Your appointment is tomorrow at 10 AM',
  firstRunAt: new Date('2025-01-15T09:00:00').toISOString()
});
```

## License

Private - VBE Eye Center
