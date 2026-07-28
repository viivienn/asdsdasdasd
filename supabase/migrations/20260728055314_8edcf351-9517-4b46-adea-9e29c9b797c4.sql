-- 1. Class records -------------------------------------------------------
insert into public.treatments (name, slug, category, treatment_class, entity_type, sort_rank, publication_status, is_sample, summary, primary_purpose)
values
  ('Neuromodulators', 'neuromodulator', 'Neuromodulator', 'Botulinum toxin injectable', 'class', 10, 'published', false,
   'Injectable botulinum toxin products that temporarily reduce the activity of targeted facial muscles.',
   'Commonly used to soften the appearance of movement-related facial lines.'),
  ('Collagen stimulators', 'collagen-stimulator', 'Biostimulator', 'Injectable collagen stimulator', 'class', 12, 'published', false,
   'Injectables that work gradually by prompting the body''s own collagen response rather than adding immediate volume.',
   'Commonly used where a gradual change in facial fullness or skin quality is the goal.'),
  ('Energy-based devices', 'energy-device', 'Energy device', 'Energy-based skin device', 'class', 14, 'published', false,
   'Devices that deliver radiofrequency, ultrasound or light energy into the skin or deeper tissue.',
   'Commonly used for skin tightening, lifting or resurfacing without injectables.')
on conflict (slug) do nothing;

-- 2. Brand families -------------------------------------------------------
insert into public.treatments (name, slug, category, treatment_class, brand_name, generic_name, manufacturer, entity_type, sort_rank, publication_status, is_sample, summary, fda_status)
values
  ('Juvéderm', 'juvederm', 'Dermal filler', 'Hyaluronic-acid dermal filler family', 'Juvéderm', 'hyaluronic acid', 'Allergan Aesthetics', 'brand_family', 20, 'published', false,
   'A family of hyaluronic-acid dermal fillers with different gel consistencies intended for different facial areas.',
   'Several products in the family are FDA-approved; approvals are product-specific.'),
  ('Restylane', 'restylane', 'Dermal filler', 'Hyaluronic-acid dermal filler family', 'Restylane', 'hyaluronic acid', 'Galderma', 'brand_family', 21, 'published', false,
   'A family of hyaluronic-acid dermal fillers offered in several gel formulations for different facial areas.',
   'Several products in the family are FDA-approved; approvals are product-specific.')
on conflict (slug) do nothing;

-- 3. New products ---------------------------------------------------------
insert into public.treatments (name, slug, category, treatment_class, brand_name, generic_name, manufacturer, entity_type, sort_rank, publication_status, is_sample, summary, fda_status)
values
  ('Xeomin', 'xeomin', 'Neuromodulator', 'Botulinum toxin type A', 'Xeomin', 'incobotulinumtoxinA', 'Merz Aesthetics', 'product', 31, 'published', false,
   'A botulinum toxin type A product formulated without accessory proteins.',
   'FDA-approved for the temporary improvement of the appearance of glabellar lines in adults.'),
  ('Daxxify', 'daxxify', 'Neuromodulator', 'Botulinum toxin type A', 'Daxxify', 'daxibotulinumtoxinA-lanm', 'Revance Therapeutics', 'product', 32, 'published', false,
   'A botulinum toxin type A product stabilised with a peptide rather than human serum albumin.',
   'FDA-approved for the temporary improvement of the appearance of glabellar lines in adults.'),
  ('Juvéderm Voluma XC', 'juvederm-voluma', 'Dermal filler', 'Hyaluronic-acid dermal filler', 'Juvéderm Voluma XC', 'hyaluronic acid with lidocaine', 'Allergan Aesthetics', 'product', 40, 'published', false,
   'A firmer hyaluronic-acid gel in the Juvéderm family intended for deep injection in the mid-face.',
   'FDA-approved for deep injection in the cheek area to correct age-related volume deficit in adults over 21.'),
  ('Restylane Lyft', 'restylane-lyft', 'Dermal filler', 'Hyaluronic-acid dermal filler', 'Restylane Lyft', 'hyaluronic acid with lidocaine', 'Galderma', 'product', 41, 'published', false,
   'A firmer hyaluronic-acid gel in the Restylane family intended for deeper placement.',
   'FDA-approved for cheek augmentation and the correction of age-related midface contour deficiencies in adults over 21.')
on conflict (slug) do nothing;

-- 4. Promote existing prototype rows to factual catalog records ------------
update public.treatments set
  is_sample = false,
  mechanism = null, adds_volume = null, tightening_level = null, result_timing = null,
  sessions_text = null, downtime_text = null, longevity_text = null, pain_level = null,
  reversibility = null, major_risks = null, most_likely_disappointment = null,
  marketing_misconception = null, provider_variables = null, skin_tone_notes = null,
  appointment_time = null, swelling_text = null, bruising_text = null,
  exercise_restrictions = null, what_it_changes = null, what_it_does_not_change = null,
  expected_result_magnitude = null, true_substitute_notes = null, when_not_appropriate = null,
  evidence_grade = null
where slug in ('botox','dysport','sculptra','radiesse','ha-filler','thermage','ultherapy','morpheus8')
  and is_sample = true;

update public.treatments set fda_status = 'FDA-approved for the temporary improvement of the appearance of glabellar lines in adults.' where slug in ('botox','dysport');
update public.treatments set fda_status = 'FDA-approved for the correction of nasolabial fold contour deficiencies and for facial fat loss in people with HIV.' where slug = 'sculptra';
update public.treatments set fda_status = 'FDA-approved for the correction of moderate to severe facial folds and wrinkles, and for hand volume loss.' where slug = 'radiesse';
update public.treatments set fda_status = 'FDA-cleared for non-invasive treatment of facial wrinkles and rhytids.' where slug = 'thermage';
update public.treatments set fda_status = 'FDA-cleared for non-invasive lift of the eyebrow, submental area and neck, and for décolletage lines.' where slug = 'ultherapy';
update public.treatments set fda_status = 'FDA-cleared as a fractional radiofrequency microneedling device for dermatological procedures requiring coagulation of soft tissue.' where slug = 'morpheus8';

update public.treatments set summary = 'A hyaluronic-acid gel injected to add immediate volume or soften a contour, and dissolvable with hyaluronidase.' where slug = 'ha-filler' and summary is null;

-- 5. Parent links ---------------------------------------------------------
update public.treatments p set parent_id = c.id
from public.treatments c
where c.slug = 'neuromodulator' and p.slug in ('botox','dysport','xeomin','daxxify');

update public.treatments p set parent_id = c.id
from public.treatments c
where c.slug = 'ha-filler' and p.slug in ('juvederm','restylane');

update public.treatments p set parent_id = c.id
from public.treatments c
where c.slug = 'juvederm' and p.slug = 'juvederm-voluma';

update public.treatments p set parent_id = c.id
from public.treatments c
where c.slug = 'restylane' and p.slug = 'restylane-lyft';

update public.treatments p set parent_id = c.id
from public.treatments c
where c.slug = 'collagen-stimulator' and p.slug in ('sculptra','radiesse');

update public.treatments p set parent_id = c.id
from public.treatments c
where c.slug = 'energy-device' and p.slug in ('thermage','ultherapy','morpheus8');

-- 6. At-a-glance summaries -------------------------------------------------
update public.treatments set at_a_glance = '{"onset":"2–7 days","duration":"3–4 months","downtime":"Minimal","discomfort":"Low","reversibility":"Not reversible; wears off"}'::jsonb where slug in ('botox','dysport','xeomin');
update public.treatments set at_a_glance = '{"onset":"2–7 days","duration":"Up to 6 months in trials","downtime":"Minimal","discomfort":"Low","reversibility":"Not reversible; wears off"}'::jsonb where slug = 'daxxify';
update public.treatments set at_a_glance = '{"onset":"Immediate","duration":"6–18 months by product","downtime":"Minimal","discomfort":"Low to moderate","reversibility":"Dissolvable with hyaluronidase"}'::jsonb where slug in ('ha-filler','juvederm','restylane');
update public.treatments set at_a_glance = '{"onset":"Immediate","duration":"Up to 2 years in the cheek area","downtime":"Minimal","discomfort":"Low to moderate","reversibility":"Dissolvable with hyaluronidase"}'::jsonb where slug in ('juvederm-voluma','restylane-lyft');
update public.treatments set at_a_glance = '{"onset":"Gradual over weeks","duration":"Up to 2 years reported","downtime":"Minimal","discomfort":"Moderate","reversibility":"Not reversible"}'::jsonb where slug in ('sculptra','collagen-stimulator');
update public.treatments set at_a_glance = '{"onset":"Immediate, then gradual","duration":"12–18 months reported","downtime":"Minimal","discomfort":"Moderate","reversibility":"Not reversible"}'::jsonb where slug = 'radiesse';
update public.treatments set at_a_glance = '{"onset":"Gradual over 2–6 months","duration":"About 1 year reported","downtime":"None to minimal","discomfort":"Moderate","reversibility":"Not reversible"}'::jsonb where slug in ('thermage','ultherapy','energy-device');
update public.treatments set at_a_glance = '{"onset":"Gradual over weeks","duration":"Varies; multiple sessions typical","downtime":"Several days of redness","discomfort":"Moderate","reversibility":"Not reversible"}'::jsonb where slug = 'morpheus8';
update public.treatments set at_a_glance = '{"onset":"Immediate glow","duration":"Days to a few weeks","downtime":"None","discomfort":"Low","reversibility":"Not applicable"}'::jsonb where slug in ('hydrafacial','diamondglow');
update public.treatments set at_a_glance = '{"onset":"2–7 days","duration":"3–6 months by product","downtime":"Minimal","discomfort":"Low","reversibility":"Not reversible; wears off"}'::jsonb where slug = 'neuromodulator';

-- 7. Identity sources ------------------------------------------------------
insert into public.treatment_sources (treatment_id, claim_field, source_title, source_url, source_type, is_sample)
select t.id, v.claim_field, v.source_title, v.source_url, 'regulator', false
from public.treatments t
join (values
  ('botox','fda_status','BOTOX Cosmetic prescribing information','https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/103000s5ocs.pdf'),
  ('dysport','fda_status','DYSPORT prescribing information','https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/125274s122lbl.pdf'),
  ('xeomin','fda_status','XEOMIN prescribing information','https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/125360s080lbl.pdf'),
  ('daxxify','fda_status','DAXXIFY prescribing information','https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/761127s000lbl.pdf'),
  ('sculptra','fda_status','SCULPTRA summary of safety and effectiveness','https://www.accessdata.fda.gov/cdrh_docs/pdf3/P030050S002b.pdf'),
  ('radiesse','fda_status','RADIESSE summary of safety and effectiveness','https://www.accessdata.fda.gov/cdrh_docs/pdf5/P050037b.pdf'),
  ('juvederm-voluma','fda_status','JUVÉDERM VOLUMA XC summary of safety and effectiveness','https://www.accessdata.fda.gov/cdrh_docs/pdf11/P110033b.pdf'),
  ('restylane-lyft','fda_status','RESTYLANE LYFT summary of safety and effectiveness','https://www.accessdata.fda.gov/cdrh_docs/pdf4/P040024S086b.pdf'),
  ('ultherapy','fda_status','Ultherapy 510(k) clearance summary','https://www.accessdata.fda.gov/cdrh_docs/pdf13/K133895.pdf'),
  ('thermage','fda_status','Thermage 510(k) clearance summary','https://www.accessdata.fda.gov/cdrh_docs/pdf15/K150456.pdf'),
  ('morpheus8','fda_status','Morpheus8 510(k) clearance summary','https://www.accessdata.fda.gov/cdrh_docs/pdf19/K192391.pdf')
) as v(slug, claim_field, source_title, source_url) on v.slug = t.slug
where not exists (
  select 1 from public.treatment_sources s
  where s.treatment_id = t.id and s.claim_field = v.claim_field and s.source_url = v.source_url
);

-- 8. Comparison row templates ---------------------------------------------
update public.comparisons set row_template = 'neuromodulator_brands' where slug = 'botox-vs-dysport';
update public.comparisons set row_template = 'lifting_devices' where slug in ('thermage-vs-ultherapy','morpheus8-vs-ultherapy');
update public.comparisons set row_template = 'cross_category' where slug in ('sculptra-vs-radiesse','sculptra-vs-ha-filler');
update public.comparisons set row_template = 'resurfacing_devices' where slug = 'hydrafacial-vs-diamondglow';