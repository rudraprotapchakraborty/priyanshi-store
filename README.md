# Priyanshi Store

Personal store built with Next.js 16 (App Router) + MongoDB.

- `/` home, `/products` catalogue (products come from MongoDB)
- Email/password sign-in and sign-up, plus Google sign-in/sign-up
- Admins can add, edit and delete products on `/products`; photos are resized in the browser and hosted on ImgBB

## Making someone an admin

Everyone signs up as a normal user. To make an account an admin, change its `role` from `"user"` to `"admin"` in the `users` collection of the `priyanshi-store` database. It takes effect on their next page load — no need to sign out.

## Setup

1. Copy `.env.example` to `.env.local` and fill it in.
2. In Google Cloud Console → APIs & Services → Credentials → your OAuth client, add these **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://<your-domain>/api/auth/google/callback` (production)
3. `npm install`
4. `npm run seed` — inserts Worry Stone and To-Be List (₹299 each). Safe to re-run.
5. `npm run dev`
