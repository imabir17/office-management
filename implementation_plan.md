# Implementation Plan: Supabase Backend & Authentication Migration

Moving from local browser storage to a secure, cloud-based PostgreSQL database with Authentication is the critical next step to make FinFlow a true enterprise application. 

## Goal Description
We will integrate **Supabase** as our backend. This involves setting up authentication so users must log in to view their dashboard, and migrating all local storage logic (transactions and company profiles) into a secure PostgreSQL database protected by Row Level Security (RLS). 

Before starting the backend work, I will also quickly swap out the text-based hamburger menu on mobile for a proper SVG icon to finalize the frontend polish.

## Proposed Changes

### 1. Frontend Finalization
- **Mobile Menu:** Update the mobile header in `page.tsx` to use a professional SVG hamburger/close icon instead of the basic text symbols ("☰" / "✕").

### 2. Dependencies & Setup
- **Install Supabase:** Run `npm install @supabase/supabase-js`.
- **Environment Variables:** Create a `.env.local` file to hold your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 3. Database Architecture (Supabase SQL)
I will provide you with a SQL script to run in your Supabase SQL Editor that creates:
- **`transactions` table:** Stores `amount`, `type`, `date`, `time`, `payer`, `receiver`, `purpose`, and `user_id`.
- **`company_profiles` table:** Stores `company_name`, `logo_url`, and `user_id`.
- **Row Level Security (RLS):** Policies to ensure that a logged-in user can **only** read, write, and delete data that belongs to their specific `user_id`.

### 4. Authentication Flow
- **Auth UI:** Create an `Auth.tsx` component with a sleek, branded Login and Sign-Up form (Email/Password).
- **App Shell Routing:** Modify `page.tsx` to act as an auth gate. If a user is not logged in, they will only see the Auth screen. Once logged in, the main Dashboard UI will render.

### 5. State Management Refactor (`FinanceContext.tsx`)
- Rip out all `localStorage` logic.
- Replace it with live Supabase database calls:
  - On login, fetch all transactions and the company profile for the current user.
  - When adding/deleting a transaction, write to the Supabase database first, then update the UI state.
  - When uploading a logo, upload the image file to a Supabase Storage Bucket and save the public URL, rather than saving massive Base64 strings to local storage.

## User Review Required
> [!IMPORTANT]
> To execute this plan, you will need to create a free account at [Supabase](https://supabase.com), create a new project, and provide me with your Project URL and Anon Key. 

## Open Questions
1. I plan to build a custom Login/Signup form that matches our new Stark Black / Light theme. Is Email/Password authentication sufficient for now, or do you want Google OAuth as well?
2. Are you ready to create the Supabase project right now? If so, please create it, go to Project Settings -> API, and paste your **Project URL** and **anon key** here so I can wire it up!

## Verification Plan
1. Attempt to view the dashboard without logging in (should be blocked).
2. Create a new account, verify it writes to the Supabase Auth system.
3. Add a transaction, verify it appears in the Supabase Table Editor.
4. Upload a logo, verify it uploads to Supabase Storage.
