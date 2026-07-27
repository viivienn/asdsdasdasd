-- 1. Ensure no direct client write privileges on public submission tables.
REVOKE INSERT, UPDATE, DELETE ON public.city_requests FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.price_alert_interest FROM anon, authenticated;
REVOKE SELECT ON public.city_requests FROM anon;
REVOKE SELECT ON public.price_alert_interest FROM anon;
GRANT SELECT ON public.city_requests TO authenticated;
GRANT SELECT ON public.price_alert_interest TO authenticated;
GRANT ALL ON public.city_requests TO service_role;
GRANT ALL ON public.price_alert_interest TO service_role;

-- 2. Explicit deny-by-default write policies (documented intent, no client writes).
DROP POLICY IF EXISTS "city_requests no client writes" ON public.city_requests;
CREATE POLICY "city_requests no client writes"
  ON public.city_requests FOR INSERT TO anon, authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "price_alert_interest no client writes" ON public.price_alert_interest;
CREATE POLICY "price_alert_interest no client writes"
  ON public.price_alert_interest FOR INSERT TO anon, authenticated
  WITH CHECK (false);

-- 3. Database-level shape validation for every stored submission.
ALTER TABLE public.city_requests
  DROP CONSTRAINT IF EXISTS city_requests_email_valid,
  DROP CONSTRAINT IF EXISTS city_requests_postal_code_valid,
  DROP CONSTRAINT IF EXISTS city_requests_field_lengths,
  DROP CONSTRAINT IF EXISTS city_requests_consent_required;

ALTER TABLE public.city_requests
  ADD CONSTRAINT city_requests_email_valid
    CHECK (email ~* '^[^@\s]+@[^@\s.]+\.[^@\s]+$' AND length(email) <= 254),
  ADD CONSTRAINT city_requests_postal_code_valid
    CHECK (length(btrim(postal_code)) BETWEEN 3 AND 12),
  ADD CONSTRAINT city_requests_field_lengths
    CHECK (
      (city IS NULL OR length(city) <= 120)
      AND (treatment_slug IS NULL OR treatment_slug ~ '^[a-z0-9-]{1,80}$')
      AND (source_path IS NULL OR length(source_path) <= 300)
    ),
  ADD CONSTRAINT city_requests_consent_required CHECK (consent = true);

ALTER TABLE public.price_alert_interest
  DROP CONSTRAINT IF EXISTS price_alert_email_valid,
  DROP CONSTRAINT IF EXISTS price_alert_postal_code_valid,
  DROP CONSTRAINT IF EXISTS price_alert_field_shape;

ALTER TABLE public.price_alert_interest
  ADD CONSTRAINT price_alert_email_valid
    CHECK (email ~* '^[^@\s]+@[^@\s.]+\.[^@\s]+$' AND length(email) <= 254),
  ADD CONSTRAINT price_alert_postal_code_valid
    CHECK (length(btrim(postal_code)) BETWEEN 3 AND 12),
  ADD CONSTRAINT price_alert_field_shape
    CHECK (
      treatment_slug ~ '^[a-z0-9-]{1,80}$'
      AND (max_unit_price IS NULL OR (max_unit_price >= 0 AND max_unit_price <= 100000))
      AND (source_path IS NULL OR length(source_path) <= 300)
    );