# 🔐 My Secure Vault - Multi-User, Multi-Device Password Manager

Production-ready, zero-knowledge, multi-user, multi-device **Secure Password Manager** built with Vanilla HTML, CSS, JavaScript, **Web Crypto API** (AES-GCM 256-bit + PBKDF2), and **Supabase** (Auth + PostgreSQL + Row Level Security).

---

## 🛠️ Security Architecture Overview

1. **Zero-Knowledge Encryption**: All vault items are encrypted on your local device before being sent over the network.
2. **Master Password Protection**: The Master Password is NEVER stored in plaintext, logged, or sent to the cloud. It is used strictly in client-side RAM to derive a 256-bit AES-GCM vault encryption key via PBKDF2 with SHA-256.
3. **Database Isolation**: Supabase Row Level Security (RLS) ensures that User A can NEVER query or view User B's vault records.
4. **Multi-Device Synchronization**: Changes made on one device (Phone, Tablet, Laptop, Desktop) automatically sync to the encrypted cloud database and appear on your other devices.

---

## 🚀 Setup & Deployment Guide

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in or create a free account.
2. Click **New Project** and name it `my-secure-vault`.
3. Set a strong database password and select your region. Click **Create new project**.

---

### Step 2: Enable Authentication
1. In your Supabase Dashboard, navigate to **Authentication -> Providers**.
2. Ensure **Email** is enabled.
3. Under **Authentication -> Settings**, you can toggle *Confirm email* off for quick local testing if desired.

---

### Step 3: Create Database Tables & Step 4: Apply Row Level Security (RLS)
1. In your Supabase Dashboard, open the **SQL Editor** from the left menu.
2. Click **New Query**.
3. Copy and paste the contents of [schema.sql](file:///c:/Users/acer/Desktop/personal-pass/schema.sql) into the query editor:

```sql
-- Create Vaults Table
CREATE TABLE IF NOT EXISTS public.vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_vault TEXT NOT NULL,
  salt TEXT NOT NULL,
  verify_iv TEXT,
  verify_cipher TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;

-- Apply Row Level Security Policies
CREATE POLICY "Users can view own vault" ON public.vaults FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vault" ON public.vaults FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vault" ON public.vaults FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own vault" ON public.vaults FOR DELETE USING (auth.uid() = user_id);
```

4. Click **Run**. You will see `Success. No rows returned`.

---

### Step 5: Configure Environment Variables / Credentials
1. Go to **Project Settings -> API** in your Supabase dashboard.
2. Copy the **Project URL** and **anon public API key**.
3. Open [js/supabaseClient.js](file:///c:/Users/acer/Desktop/personal-pass/js/supabaseClient.js) and replace the placeholders:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsIn...';
```

> ⚠️ **IMPORTANT**: NEVER expose your `service_role` secret key in frontend code! Only use the `anon` public key.

---

### Step 6: How to Run Locally
1. Open the project folder in VS Code or your terminal.
2. Start any local web server (e.g. using Live Server extension in VS Code, `python -m http.server 8000`, or `npx http-server`).
3. Open `http://localhost:8000` in your web browser.

---

### Step 7: How to Deploy to Vercel / Netlify & Step 8: Connect Frontend to Supabase
1. Push your repository to GitHub / GitLab.
2. Log in to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. Import your repository and click **Deploy**.
4. To pass environment variables safely in Vercel/Netlify, you can inject window variables in `index.html` or set your `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `js/supabaseClient.js`.

---

### Step 9: Testing Registration
1. Open the application. On the Landing Page, click **Create New Account**.
2. Enter your Full Name, Username/Email, and Master Password.
3. Check the warning box and click **Create Secure Vault & Account**.
4. Verify you enter the dashboard with a welcome message: `Welcome, [Name]`.

---

### Step 10: Testing Login
1. Click **🔒 Lock Vault** in the dashboard header.
2. On the Landing Page, click **I Already Have an Account**.
3. Enter your Username/Email and Master Password.
4. Click **Login / Unlock Vault**. Verify your vault unlocks.

---

### Step 11: Testing Multi-Device Access
1. Open the website on **Device A** (e.g., Phone or Browser 1). Log in and add a credential (e.g., Gmail).
2. Open the website on **Device B** (e.g., Laptop or Browser 2 / Incognito).
3. Log in with the **SAME** username and Master Password on Device B.
4. Verify the Gmail credential appears on Device B automatically!

---

### Step 12: Testing Encrypted Vault Security
1. Log into your Supabase Dashboard and click **Table Editor -> vaults**.
2. Inspect the `encrypted_vault` column for your user.
3. Observe that all site names, usernames, and passwords are stored as AES-GCM ciphertext strings. Plaintext passwords or Master Passwords are NEVER present in the database.

---

### Step 13: Testing Backup & Restore
1. In the Dashboard, click **⚙️ Settings -> Backup & Restore**.
2. Click **⬇️ Export Backup**. An encrypted `.enc` file will download to your device.
3. You can restore this backup file on any device by clicking **⬆️ Import Backup**.

---

## 📁 Project File Structure

```
/
├── index.html               # Main single-page interface (Landing, Auth, Dashboard, Modals)
├── schema.sql               # Supabase database schema & RLS policies
├── README.md                # Full setup & deployment documentation
├── css/
│   └── style.css            # Custom CSS styles (Theme tokens, glassmorphism, responsive grid)
└── js/
    ├── app.js               # Main application orchestrator & event listeners
    ├── auth.js              # Supabase Auth user signup, login & session manager
    ├── crypto.js            # Web Crypto API engine (AES-GCM, PBKDF2, Base64 helpers)
    ├── db.js                # Local IndexedDB storage cache
    ├── generator.js         # CSPRNG secure password generator
    ├── supabaseClient.js    # Supabase public client configuration
    ├── ui.js                # UI rendering helpers, toast notifications, cards
    └── vault.js             # Zero-knowledge cloud vault synchronization engine
```
