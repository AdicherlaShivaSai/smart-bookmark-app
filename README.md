# Smart Bookmark App
A simple, secure bookmark manager built with **Next.js App Router**, **Supabase**, and **Tailwind CSS**.
Users can sign in with Google, manage their private bookmarks, and see real-time updates across tabs.

### 🔗 Live Demo
👉 **Vercel URL** :

### 📦 GitHub Repository
👉 **GitHub** : 

## 🚀 Features
- Google authentication using **Supabase Auth** (OAuth only)
- Add bookmarks (title + URL)
- Bookmarks are **private per user**
- Delete your own bookmarks
- **Real-time updates** across multiple tabs
- Clean, minimal UI with Tailwind CSS
- Deployed on **Vercel**

## 🛠 Tech Stack
- **Next.js** (App Router)
- **Supabase**
    - Auth (Google OAuth)
    - PostgreSQL Database
    - Realtime
- **Tailwind CSS**
- **Vercel** (Deployment)

## 📁 Project Structure
```
app/
 ├─ layout.tsx
 ├─ page.tsx
 ├─ globals.css
components/
 ├─ BookmarkList.tsx
lib/
 └─ supabaseClients.ts
```

## 🚀 Run Locally

```bash
git clone <repo-url>
cd smart-bookmark-app
npm install
npm run dev
```

## 🧠 Key Implementation Details
### Authentication
- Used **Supabase Google OAuth**
- Google redirects to Supabase’s callback:

    ```
    https://<PROJECT_REF>.supabase.co/auth/v1/callback
    ```
- Supabase then redirects back to the app using allowed redirect URLs

### Database Schema
```
bookmarks
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- title (text)
- url (text)
- created_at (timestamp)
```

### Row Level Security (RLS)

To ensure privacy, **RLS is enabled** so users can only access their own bookmarks.

Policies used:
```
-- Enable RLS
alter table bookmarks enable row level security;

-- Select own bookmarks
create policy "Users can view own bookmarks"
on bookmarks for select
using (auth.uid() = user_id);

-- Insert own bookmarks
create policy "Users can insert own bookmarks"
on bookmarks for insert
with check (auth.uid() = user_id);

-- Delete own bookmarks
create policy "Users can delete own bookmarks"
on bookmarks for delete
using (auth.uid() = user_id);

```
To simplify inserts, `user_id` is auto-filled:
```
alter table bookmarks
alter column user_id
set default auth.uid();
```

## 🔄 Real-time Updates
- Supabase Realtime listens to changes in the `bookmarks` table
- Filters updates by `user_id`
- Allows instant sync across multiple open tabs

## ⚠️ Problems Faced & How I Solved Them

### 1. Google OAuth `redirect_uri_mismatch`

**Issue:**

Google OAuth initially failed due to incorrect redirect configuration.

**Solution:**

- Learned that Supabase manages OAuth internally
- Updated Google redirect URI to:

    ```
    https://<PROJECT_REF>.supabase.co/auth/v1/callback
    ```
- Removed manual `redirectTo` from frontend code

### 2. Bookmarks not inserting

**Issue:**

Bookmarks were not appearing after clicking “Add”.

**Cause:**

RLS was blocking inserts because `user_id` wasn’t set correctly.

**Solution:**

- Set `user_id` default to `auth.uid()`
- Removed `user_id` from client-side insert logic

### 3. Delete worked only after refresh

**Issue:**

Delete succeeded in database but UI didn’t update immediately.

**Solution:**

- Explicitly re-fetched bookmarks after delete
- Ensured frontend state stays in sync with backend

## 🚀 Deployment
- Deployed on **Vercel**
- Environment variables used:

    ```
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    ```
- Added Vercel URL to Supabase Auth redirect URLs

## ✅ Final Notes
This project focuses on:
- Correct authentication flow
- Secure per-user data access
- Real-time behavior
- Clean, readable code

## 📬 Contact
Built by Shiva Sai Adicherla

Happy to explain any part of the implementation 🙂
