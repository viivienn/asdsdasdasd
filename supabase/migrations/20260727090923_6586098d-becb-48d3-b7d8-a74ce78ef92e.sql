ALTER TABLE public.treatments
  ADD COLUMN IF NOT EXISTS appointment_time text,
  ADD COLUMN IF NOT EXISTS swelling_text text,
  ADD COLUMN IF NOT EXISTS bruising_text text,
  ADD COLUMN IF NOT EXISTS exercise_restrictions text,
  ADD COLUMN IF NOT EXISTS what_it_changes text,
  ADD COLUMN IF NOT EXISTS what_it_does_not_change text,
  ADD COLUMN IF NOT EXISTS expected_result_magnitude text,
  ADD COLUMN IF NOT EXISTS true_substitute_notes text,
  ADD COLUMN IF NOT EXISTS when_not_appropriate text;

ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS regular_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS quantity numeric(12,2),
  ADD COLUMN IF NOT EXISTS effective_unit_price numeric(12,3),
  ADD COLUMN IF NOT EXISTS new_customer_only boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS membership_required boolean NOT NULL DEFAULT false;

ALTER TYPE public.verification_status ADD VALUE IF NOT EXISTS 'publicly_listed';

CREATE TABLE IF NOT EXISTS public.comparison_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_a text NOT NULL,
  treatment_b text NOT NULL,
  email text,
  context text,
  source_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comparison_requests_a_len CHECK (char_length(treatment_a) BETWEEN 2 AND 80),
  CONSTRAINT comparison_requests_b_len CHECK (char_length(treatment_b) BETWEEN 2 AND 80),
  CONSTRAINT comparison_requests_email_fmt CHECK (email IS NULL OR (char_length(email) <= 254 AND email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')),
  CONSTRAINT comparison_requests_context_len CHECK (context IS NULL OR char_length(context) <= 1000),
  CONSTRAINT comparison_requests_source_len CHECK (source_path IS NULL OR char_length(source_path) <= 200)
);

GRANT ALL ON public.comparison_requests TO service_role;
GRANT SELECT ON public.comparison_requests TO authenticated;

ALTER TABLE public.comparison_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comparison_requests admin read"
  ON public.comparison_requests FOR SELECT TO authenticated
  USING ((SELECT private.has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "comparison_requests no client writes"
  ON public.comparison_requests FOR INSERT TO anon, authenticated
  WITH CHECK (false);