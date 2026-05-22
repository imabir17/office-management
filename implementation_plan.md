# Implementation Plan: Multi-Tenant Architecture & Audit Logging

Based on your requirements, all users within a company will have equal access, and an audit trail will track all activities. Below is the proposed workflow for how this system will operate, followed by the technical changes required.

## How It Will Work (The User Journey)

### 1. Company Creation (The Founder)
When a brand-new user signs up for the portal, the system will detect that they are not attached to any company. 
1. They will be greeted with an onboarding screen asking them to "Name Your Company".
2. Upon submitting, the system creates a new Workspace (`company_id`) and attaches the Founder to it. They are now inside their private dashboard.

### 2. Inviting Team Members
To add employees or accountants to the portal:
1. The Founder goes to **Settings > Team Management**.
2. The Founder types in the email address of the employee they want to add.
3. The system preemptively links that email address to the company's workspace.
4. When the employee goes to the website and signs up using that exact email address, the system immediately drops them into the company's shared dashboard.

### 3. The Audit Log (Tracking Actions)
Every time a user performs an action, the system will secretly record it.
1. We will create an `audit_logs` table in the database.
2. Whenever a user logs in, adds an Income record, deletes an Expense, or invites a team member, a log entry is written containing: `[Timestamp] | [User Email] | [Action Description]`.
3. In **Settings > Activity Logs**, anyone in the company can scroll through a chronological feed of exactly who did what, and when.

---

## Technical Proposed Changes

### 1. Database Schema Overhaul (Supabase SQL)
We will run a new SQL script to drop the old tables and create the following relational structure:
- **`companies`**: `id`, `name`, `logo_url`
- **`team_members`**: `id`, `company_id`, `email`
- **`transactions`**: `id`, `company_id`, `type`, `amount`, etc.
- **`audit_logs`**: `id`, `company_id`, `user_email`, `action`, `created_at`

### 2. Updated Row Level Security (RLS)
The RLS policies will be strictly tied to the `team_members` table. A user can only read/write to `transactions` or `audit_logs` if their authenticated email exists in the `team_members` table for that specific `company_id`.

### 3. Frontend UI Updates
- **Onboarding Component**: A new screen intercepting new users who don't have a company yet.
- **Team Management Tab**: A UI inside Settings to add/remove employee emails.
- **Activity Logs Tab**: A UI inside Settings to fetch and display the `audit_logs` feed.
- **Context Refactor**: The `FinanceContext` will be updated to write an audit log entry every time a state mutation (add/delete) occurs.

## User Review Required
> [!IMPORTANT]  
> Please review the "How It Will Work" journey above. 
> 
> Does this flow (Founder creates company -> Founder whitelists employee emails -> Employees sign up and gain instant access) make sense for your business logic? 
> 
> If you approve this workflow, I will generate the massive SQL script to rebuild your database and we will begin building the frontend!
