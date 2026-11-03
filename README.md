# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

---

## Customer accounts & order tracking

Routes: `/login` (login/signup), `/my-orders` (history + live status timeline), `/track` (lookup by Order ID + phone, mainly for older guest orders).

Checkout requires login. Admin stays signed in between visits. Manage Products supports add / edit / remove with camera or device photo upload (run `supabase-migration-products.sql`). Admin can edit the shop name, contact details and footer text under Admin -> Shop Settings (run `supabase-migration-settings.sql`).


Also run `supabase-migration-order-safety.sql` (server-side pricing + stock). `vercel.json` / `public/_redirects` make direct links work on Vercel/Netlify. Forgot-password: add your site URL under Supabase -> Authentication -> URL Configuration (Site URL + Redirect URLs, including `/reset-password`).

### Setup (once)
1. Supabase SQL Editor: run `supabase-schema.sql`, then `supabase-migration-customer-auth.sql`.
2. Create your admin user in Supabase -> Authentication -> Users, then run:
   `INSERT INTO admins (user_id) SELECT id FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL';`
   Only users in the `admins` table can open `/admin/*`; ordinary customers cannot.
3. Copy `.env.example` to `.env` and fill in your keys.
4. (Optional) Authentication -> Providers -> Email: turn off "Confirm email" if you want instant signup login.
