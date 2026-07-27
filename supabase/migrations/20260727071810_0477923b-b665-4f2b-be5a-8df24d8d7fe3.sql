-- ============ private schema + role helper ============
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE TYPE public.app_role AS ENUM ('admin', 'editor');
CREATE TYPE public.publication_status AS ENUM ('draft', 'review', 'published');
CREATE TYPE public.verification_status AS ENUM ('unverified', 'source_checked', 'clinic_confirmed', 'expired');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE POLICY "user_roles admin read" ON public.user_roles
  FOR SELECT TO authenticated
  USING ((SELECT private.has_role(auth.uid(), 'admin')));

-- shared updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============ treatments ============
CREATE TABLE public.treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  treatment_class text NOT NULL,
  brand_name text,
  generic_name text,
  summary text,
  primary_purpose text,
  mechanism text,
  adds_volume text,
  tightening_level text,
  result_timing text,
  sessions_text text,
  downtime_text text,
  longevity_text text,
  pain_level text,
  reversibility text,
  major_risks text,
  most_likely_disappointment text,
  marketing_misconception text,
  provider_variables text,
  skin_tone_notes text,
  fda_status text,
  evidence_grade text,
  last_reviewed_at timestamptz,
  publication_status public.publication_status NOT NULL DEFAULT 'draft',
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.treatments TO anon, authenticated;
GRANT ALL ON public.treatments TO service_role;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "treatments public read published" ON public.treatments
  FOR SELECT TO anon, authenticated
  USING (publication_status = 'published' AND is_sample = false);
CREATE POLICY "treatments admin all" ON public.treatments
  FOR ALL TO authenticated
  USING ((SELECT private.has_role(auth.uid(), 'admin')))
  WITH CHECK ((SELECT private.has_role(auth.uid(), 'admin')));
CREATE TRIGGER treatments_updated_at BEFORE UPDATE ON public.treatments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ treatment_sources ============
CREATE TABLE public.treatment_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id uuid NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  claim_field text NOT NULL,
  source_title text NOT NULL,
  source_url text NOT NULL,
  source_type text NOT NULL,
  publication_date date,
  retrieved_at timestamptz NOT NULL DEFAULT now(),
  evidence_level text,
  notes text,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.treatment_sources TO anon, authenticated;
GRANT ALL ON public.treatment_sources TO service_role;
ALTER TABLE public.treatment_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "treatment_sources public read" ON public.treatment_sources
  FOR SELECT TO anon, authenticated
  USING (is_sample = false AND EXISTS (
    SELECT 1 FROM public.treatments t
    WHERE t.id = treatment_id AND t.publication_status = 'published' AND t.is_sample = false
  ));
CREATE POLICY "treatment_sources admin all" ON public.treatment_sources
  FOR ALL TO authenticated
  USING ((SELECT private.has_role(auth.uid(), 'admin')))
  WITH CHECK ((SELECT private.has_role(auth.uid(), 'admin')));

-- ============ comparisons ============
CREATE TABLE public.comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_a_id uuid NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  treatment_b_id uuid NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  pair_key text GENERATED ALWAYS AS (
    LEAST(treatment_a_id, treatment_b_id)::text || ':' || GREATEST(treatment_a_id, treatment_b_id)::text
  ) STORED,
  slug text NOT NULL UNIQUE,
  one_sentence_difference text,
  consider_a_when text,
  consider_b_when text,
  neither_when text,
  common_misconception text,
  publication_status public.publication_status NOT NULL DEFAULT 'draft',
  is_sample boolean NOT NULL DEFAULT false,
  last_reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comparisons_canonical_order CHECK (treatment_a_id < treatment_b_id)
);
CREATE UNIQUE INDEX comparisons_pair_key_unique ON public.comparisons (pair_key);
GRANT SELECT ON public.comparisons TO anon, authenticated;
GRANT ALL ON public.comparisons TO service_role;
ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comparisons public read published" ON public.comparisons
  FOR SELECT TO anon, authenticated
  USING (publication_status = 'published' AND is_sample = false);
CREATE POLICY "comparisons admin all" ON public.comparisons
  FOR ALL TO authenticated
  USING ((SELECT private.has_role(auth.uid(), 'admin')))
  WITH CHECK ((SELECT private.has_role(auth.uid(), 'admin')));
CREATE TRIGGER comparisons_updated_at BEFORE UPDATE ON public.comparisons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ locations ============
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  region_code text NOT NULL,
  city text NOT NULL,
  city_slug text NOT NULL,
  latitude numeric(9,6),
  longitude numeric(9,6),
  coverage_status text NOT NULL DEFAULT 'requested',
  is_indexable boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_code, region_code, city_slug)
);
GRANT SELECT ON public.locations TO anon, authenticated;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations public read indexable" ON public.locations
  FOR SELECT TO anon, authenticated
  USING (is_indexable = true);
CREATE POLICY "locations admin all" ON public.locations
  FOR ALL TO authenticated
  USING ((SELECT private.has_role(auth.uid(), 'admin')))
  WITH CHECK ((SELECT private.has_role(auth.uid(), 'admin')));
CREATE TRIGGER locations_updated_at BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ clinics ============
CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  clinic_slug text NOT NULL,
  website_url text,
  address_line text,
  publication_status public.publication_status NOT NULL DEFAULT 'draft',
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (location_id, clinic_slug)
);
GRANT SELECT ON public.clinics TO anon, authenticated;
GRANT ALL ON public.clinics TO service_role;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clinics public read published" ON public.clinics
  FOR SELECT TO anon, authenticated
  USING (publication_status = 'published' AND is_sample = false);
CREATE POLICY "clinics admin all" ON public.clinics
  FOR ALL TO authenticated
  USING ((SELECT private.has_role(auth.uid(), 'admin')))
  WITH CHECK ((SELECT private.has_role(auth.uid(), 'admin')));
CREATE TRIGGER clinics_updated_at BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ price_observations (immutable history) ============
CREATE TABLE public.price_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  treatment_id uuid NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'USD',
  advertised_amount numeric(12,2) NOT NULL,
  regular_amount numeric(12,2),
  pricing_unit text NOT NULL,
  quantity numeric(10,2),
  effective_unit_price numeric(12,4),
  treatment_area text,
  starts_at_price boolean NOT NULL DEFAULT false,
  membership_required boolean NOT NULL DEFAULT false,
  new_customer_only boolean NOT NULL DEFAULT false,
  minimum_purchase text,
  manufacturer_reward_required boolean NOT NULL DEFAULT false,
  conditions text,
  source_url text,
  source_type text,
  observed_at date,
  expires_at date,
  verification_status public.verification_status NOT NULL DEFAULT 'unverified',
  publication_status public.publication_status NOT NULL DEFAULT 'draft',
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX price_observations_lookup ON public.price_observations (location_id, treatment_id, observed_at DESC);
GRANT SELECT ON public.price_observations TO anon, authenticated;
GRANT ALL ON public.price_observations TO service_role;
ALTER TABLE public.price_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_observations public read published" ON public.price_observations
  FOR SELECT TO anon, authenticated
  USING (
    publication_status = 'published'
    AND is_sample = false
    AND source_url IS NOT NULL
    AND observed_at IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.is_indexable = true)
  );
CREATE POLICY "price_observations admin all" ON public.price_observations
  FOR ALL TO authenticated
  USING ((SELECT private.has_role(auth.uid(), 'admin')))
  WITH CHECK ((SELECT private.has_role(auth.uid(), 'admin')));

-- Enforce immutability: observations are historical records
CREATE OR REPLACE FUNCTION public.block_price_observation_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.advertised_amount IS DISTINCT FROM OLD.advertised_amount
     OR NEW.regular_amount IS DISTINCT FROM OLD.regular_amount
     OR NEW.pricing_unit IS DISTINCT FROM OLD.pricing_unit
     OR NEW.quantity IS DISTINCT FROM OLD.quantity
     OR NEW.observed_at IS DISTINCT FROM OLD.observed_at
     OR NEW.source_url IS DISTINCT FROM OLD.source_url THEN
    RAISE EXCEPTION 'Price observations are immutable. Insert a new observation instead.';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER price_observations_immutable BEFORE UPDATE ON public.price_observations
  FOR EACH ROW EXECUTE FUNCTION public.block_price_observation_update();

-- ============ offers ============
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  treatment_id uuid NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  currency text NOT NULL DEFAULT 'USD',
  offer_amount numeric(12,2),
  pricing_unit text,
  restrictions text,
  starts_at date,
  ends_at date,
  source_url text,
  source_type text,
  observed_at date,
  verification_status public.verification_status NOT NULL DEFAULT 'unverified',
  publication_status public.publication_status NOT NULL DEFAULT 'draft',
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.offers TO anon, authenticated;
GRANT ALL ON public.offers TO service_role;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offers public read active" ON public.offers
  FOR SELECT TO anon, authenticated
  USING (
    publication_status = 'published'
    AND is_sample = false
    AND source_url IS NOT NULL
    AND observed_at IS NOT NULL
    AND (starts_at IS NULL OR starts_at <= CURRENT_DATE)
    AND (ends_at IS NULL OR ends_at >= CURRENT_DATE)
    AND EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.is_indexable = true)
  );
CREATE POLICY "offers admin all" ON public.offers
  FOR ALL TO authenticated
  USING ((SELECT private.has_role(auth.uid(), 'admin')))
  WITH CHECK ((SELECT private.has_role(auth.uid(), 'admin')));
CREATE TRIGGER offers_updated_at BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ submissions (no public read, no public insert) ============
CREATE TABLE public.city_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  postal_code text NOT NULL,
  city text,
  treatment_slug text,
  consent boolean NOT NULL DEFAULT false,
  source_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.city_requests TO service_role;
ALTER TABLE public.city_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "city_requests admin read" ON public.city_requests
  FOR SELECT TO authenticated
  USING ((SELECT private.has_role(auth.uid(), 'admin')));

CREATE TABLE public.price_alert_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  postal_code text NOT NULL,
  treatment_slug text NOT NULL,
  max_unit_price numeric(12,2),
  source_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.price_alert_interest TO service_role;
ALTER TABLE public.price_alert_interest ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_alert_interest admin read" ON public.price_alert_interest
  FOR SELECT TO authenticated
  USING ((SELECT private.has_role(auth.uid(), 'admin')));

CREATE TABLE public.submission_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX submission_audit_rate ON public.submission_audit (ip_hash, created_at DESC);
GRANT ALL ON public.submission_audit TO service_role;
ALTER TABLE public.submission_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "submission_audit admin read" ON public.submission_audit
  FOR SELECT TO authenticated
  USING ((SELECT private.has_role(auth.uid(), 'admin')));