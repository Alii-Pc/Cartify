# Cartify

A premium e-commerce landing experience built with Next.js 14 (App Router),
TypeScript, and Tailwind CSS, with a full authentication system underneath —
JWT sessions in HTTP-only cookies, bcrypt password hashing, and email
verification via Nodemailer.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   `.env.local` is already set up with your MongoDB Atlas URI and a generated
   `JWT_SECRET`. You still need to fill in real SMTP credentials so
   verification emails actually send:

   - `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM`
     — e.g. a Gmail App Password, or a dev-friendly provider like Mailtrap,
     Resend, or SMTP2GO.

   `.env.local` is in `.gitignore`, so it will never be committed if you push
   this to GitHub. See `.env.example` for the full list of variables.

   ⚠️ You pasted your real Atlas password in our chat — worth rotating it
   in Atlas's Database Access settings once you're set up, just as good
   hygiene since it's no longer a secret only you've seen.

3. **MongoDB Atlas → Network Access**

   Your cluster only accepts connections from whitelisted IPs. In Atlas,
   go to **Network Access** and add your current IP (or `0.0.0.0/0` for
   local dev only — not recommended for production).

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000

5. **Lint & format**

   ```bash
   npm run lint
   npm run format
   ```

## Project structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── verify-email/page.tsx
│   ├── dashboard/page.tsx       # Protected route
│   └── api/auth/
│       ├── register/route.ts
│       ├── login/route.ts
│       ├── logout/route.ts
│       ├── verify-email/route.ts
│       └── me/route.ts
├── components/
│   ├── layout/                  # Navbar, Footer
│   ├── landing/                 # Hero, Categories, FeaturedProducts, CTA
│   ├── ui/                       # Button, Input, Alert, Loader, Badge
│   └── auth/                    # Forms, AuthCard, LogoutButton, VerifyEmailStatus
├── lib/
│   ├── db.ts                    # Mongoose connection (cached)
│   ├── jwt.ts                   # sign/verify JWT
│   ├── mailer.ts                 # Nodemailer transporter
│   ├── authClient.ts             # fetch wrappers for auth API
│   └── validations/auth.ts       # Zod schemas
├── models/User.ts                # Mongoose User schema
├── types/index.ts
└── middleware.ts                 # Edge route protection
```

## Auth flow

1. **Signup** → `POST /api/auth/register` validates with Zod, hashes the
   password (bcrypt, via a Mongoose pre-save hook), creates the user with
   `isVerified: false`, generates a verification token, and emails a link.
2. **Verify email** → the link opens `/verify-email?token=...`, which calls
   `POST /api/auth/verify-email` to flip `isVerified` to `true`.
3. **Login** → `POST /api/auth/login` checks the password, rejects unverified
   accounts, and on success signs a JWT and sets it as an **HTTP-only,
   secure, SameSite=Lax cookie** (`cartify_token`).
4. **Route protection** → `middleware.ts` runs on the Edge, verifies the
   cookie (via `jose`, Edge-compatible), and redirects unauthenticated users
   away from `/dashboard` (and logged-in users away from `/login`/`/signup`).
   The dashboard page also re-verifies server-side as defense in depth.
5. **Logout** → `POST /api/auth/logout` clears the cookie.

## Verified before delivery

- `tsc --noEmit` — clean
- `next lint` — clean
- Dev-server smoke test — landing/login/signup/verify-email all return 200,
  unauthenticated `/dashboard` returns a 307 redirect
- Both `/api/auth/register` and `/api/auth/login` correctly reject invalid
  input with field-level Zod error messages
- MongoDB Atlas connectivity **could not be tested from this sandbox**
  (its network only allows a small allowlist of domains — `mongodb.net`
  isn't reachable from here). Test it on your own machine with
  `npm run dev` and try signing up — see Troubleshooting below if it fails.

## Troubleshooting

- **"Could not connect to any servers in your MongoDB Atlas cluster"** —
  add your current IP in Atlas → Network Access.
- **Verification email never arrives** — check `SMTP_*` values in
  `.env.local`; registration still succeeds even if the email fails to
  send (check your terminal for a logged error), so you can also grab the
  verification token directly from the `users` collection in Atlas for
  local testing if you don't want to fully set up SMTP yet.

## Next steps (suggested)

- Product listing & product detail pages
- Cart state (context or store) + cart page, wired to the navbar cart icon
- Checkout flow
- Resend-verification-email endpoint
- Forgot / reset password flow
