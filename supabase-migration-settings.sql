-- =============================================================
-- GreenBasket: editable shop name
-- Run ONCE in Supabase Dashboard -> SQL Editor (after the customer-auth migration,
-- because it uses public.is_admin()). Safe to re-run.
-- =============================================================
CREATE TABLE IF NOT EXISTS shop_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),   -- single row
  shop_name TEXT NOT NULL DEFAULT 'GreenBasket',
  updated_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO shop_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read settings" ON shop_settings;
CREATE POLICY "Anyone can read settings" ON shop_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can update settings" ON shop_settings;
CREATE POLICY "Admin can update settings" ON shop_settings FOR UPDATE USING (public.is_admin());

-- Contact details + footer tagline (added later; safe to re-run)
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '+91 98765 43210';
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT 'hello@greenbasket.in';
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT E'123, Fresh Market Lane,\nBengaluru, Karnataka 560001';
ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS tagline TEXT NOT NULL DEFAULT 'Your trusted source for farm-fresh vegetables, herbs, and authentic spices delivered straight to your doorstep.';
