-- =============================================================
-- GreenBasket: server-side Telegram order notifications
-- Run ONCE in Supabase Dashboard -> SQL Editor, AFTER deploying the
-- `notify-order` Edge Function (see README).
--
-- 1) Replace YOUR_PROJECT_REF with the part before .supabase.co in your project URL
-- 2) Replace YOUR_WEBHOOK_SECRET with a long random string (and use the SAME
--    value as the WEBHOOK_SECRET secret of the Edge Function)
-- Safe to re-run.
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url     := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-order',
      headers := jsonb_build_object(
                   'Content-Type', 'application/json',
                   'x-webhook-secret', 'YOUR_WEBHOOK_SECRET'),
      body    := jsonb_build_object('record', to_jsonb(NEW))
    );
  EXCEPTION WHEN OTHERS THEN
    -- a notification problem must never block an order
    RAISE WARNING 'notify_new_order failed: %', SQLERRM;
  END;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS orders_notify ON orders;
CREATE TRIGGER orders_notify AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_order();
