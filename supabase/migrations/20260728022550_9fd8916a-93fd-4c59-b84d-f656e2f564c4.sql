
insert into public.treatments (
  name, slug, category, treatment_class, brand_name, generic_name, summary,
  primary_purpose, mechanism, adds_volume, tightening_level, result_timing,
  sessions_text, downtime_text, longevity_text, pain_level, reversibility,
  major_risks, most_likely_disappointment, marketing_misconception,
  provider_variables, skin_tone_notes, appointment_time, swelling_text,
  bruising_text, exercise_restrictions, what_it_changes, what_it_does_not_change,
  expected_result_magnitude, true_substitute_notes, when_not_appropriate,
  fda_status, evidence_grade, last_reviewed_at, publication_status, is_sample
) values
(
  'HydraFacial', 'hydrafacial', 'Facial / exfoliation', 'Device-based hydradermabrasion facial',
  'HydraFacial', 'Hydradermabrasion',
  'A device-based facial that combines water-assisted exfoliation, suction-based pore extraction, and application of topical serums in one appointment.',
  'Commonly used for routine skin maintenance: surface exfoliation, pore congestion, and short-term skin smoothness and radiance.',
  'A handpiece delivers fluid to the skin surface while applying gentle vacuum suction, loosening surface debris and drawing it away, then applies topical serums.',
  'No. It does not add volume.',
  'None. It is not marketed as a skin-tightening procedure.',
  'Most of the visible effect is apparent immediately after the appointment.',
  'Often described as a repeat maintenance treatment, commonly scheduled on a monthly cadence by providers.',
  'Typically none; some people notice temporary redness for a short period afterwards.',
  'Effects on surface texture and radiance are generally described as short-lived, commonly measured in days to a few weeks.',
  'Generally described as comfortable; sensations reported include suction, coolness, and mild tingling.',
  'Not applicable — no material is implanted, so there is nothing to dissolve or remove.',
  'Reported effects include transient redness, dryness, tightness, irritation, and, uncommonly, breakouts or reactions to the topical serums used.',
  'Expecting a change in wrinkles, scarring, or facial contour. It works at the skin surface only.',
  'Marketing sometimes presents it as a resurfacing or anti-ageing procedure; it is a superficial exfoliation and serum-delivery facial.',
  'Device model, handpiece tips, suction strength, serum menu, add-on boosters, and operator technique vary widely between clinics and med spas.',
  'Because it is non-thermal and non-ablative, it is generally described as suitable across skin tones; individual suitability is assessed by a licensed provider.',
  'Commonly listed at roughly 30 to 50 minutes, longer with add-ons.',
  'Not typically associated with swelling.',
  'Not typically associated with bruising.',
  'None typically described.',
  'Surface exfoliation, visible pore congestion, immediate skin smoothness and radiance.',
  'Wrinkle depth, skin laxity, facial volume, pigmentation depth, or scarring.',
  'Subtle and short-term. Best understood as skin maintenance rather than correction.',
  'Broadly overlaps with DiamondGlow and with other professional exfoliation facials such as microdermabrasion and light chemical peels.',
  'People with active inflammatory skin conditions, open lesions, sunburn, or recent resurfacing procedures are commonly advised to wait; suitability is determined by a licensed provider.',
  'Delivered with a device regulated in the US as a medical device; specific clearances vary by device model and manufacturer.',
  'Widely used in practice; published controlled evidence for durable change is limited.',
  now(), 'published', false
),
(
  'DiamondGlow', 'diamondglow', 'Facial / exfoliation', 'Device-based diamond-tip dermabrasion facial',
  'DiamondGlow', 'Diamond-tip dermabrasion with serum infusion',
  'A device-based facial that uses a recessed diamond-tip wand to physically exfoliate the skin while simultaneously extracting debris and infusing condition-specific topical serums.',
  'Commonly used for routine skin maintenance: physical exfoliation, pore congestion, and short-term skin smoothness and radiance.',
  'A rotating diamond-tip wand abrades the outermost skin layer while vacuum suction removes debris and the same pass delivers a topical serum to the freshly exfoliated surface.',
  'No. It does not add volume.',
  'None. It is not marketed as a skin-tightening procedure.',
  'Most of the visible effect is apparent immediately after the appointment.',
  'Often described as a repeat maintenance treatment, commonly scheduled on a monthly cadence by providers.',
  'Typically none; temporary redness or a mildly sanded feeling may be noticed for a short period afterwards.',
  'Effects on surface texture and radiance are generally described as short-lived, commonly measured in days to a few weeks.',
  'Generally described as comfortable; sensations reported include abrasion, suction, and mild scratchiness.',
  'Not applicable — no material is implanted, so there is nothing to dissolve or remove.',
  'Reported effects include transient redness, dryness, sensitivity, irritation, and, uncommonly, post-inflammatory pigment changes if exfoliation is too aggressive.',
  'Expecting a change in wrinkles, scarring, or facial contour. It works at the skin surface only.',
  'The phrase "medical grade" is used in marketing because the device is distributed through a pharmaceutical-company aesthetics channel and its serums are provider-dispensed; it does not mean the procedure is more clinically proven or that it reaches deeper layers than other professional exfoliation facials.',
  'Diamond-tip grit, pass count, suction strength, serum selection, and operator technique vary widely between clinics and med spas.',
  'Physical abrasion depth is operator-controlled; conservative settings are commonly described for richly pigmented skin because over-exfoliation can trigger pigment changes. Suitability is assessed by a licensed provider.',
  'Commonly listed at roughly 30 to 45 minutes, longer with add-ons.',
  'Not typically associated with swelling.',
  'Not typically associated with bruising.',
  'None typically described.',
  'Surface exfoliation, visible pore congestion, immediate skin smoothness and radiance.',
  'Wrinkle depth, skin laxity, facial volume, pigmentation depth, or scarring.',
  'Subtle and short-term. Best understood as skin maintenance rather than correction.',
  'Broadly overlaps with HydraFacial and with other professional exfoliation facials such as microdermabrasion and light chemical peels.',
  'People with active inflammatory skin conditions, open lesions, sunburn, or recent resurfacing procedures are commonly advised to wait; suitability is determined by a licensed provider.',
  'Delivered with a device regulated in the US as a medical device; specific clearances vary by device model and manufacturer.',
  'Widely used in practice; published controlled evidence for durable change is limited.',
  now(), 'published', false
)
on conflict (slug) do nothing;

insert into public.treatment_sources (treatment_id, claim_field, source_title, source_url, source_type, evidence_level, is_sample)
select t.id, v.claim_field, v.source_title, v.source_url, v.source_type, v.evidence_level, false
from public.treatments t
join (values
  ('hydrafacial', 'mechanism', 'HydraFacial — how the treatment works (manufacturer)', 'https://hydrafacial.com/treatment/', 'manufacturer', 'manufacturer documentation'),
  ('hydrafacial', 'primary_purpose', 'HydraFacial — treatment overview (manufacturer)', 'https://hydrafacial.com/', 'manufacturer', 'manufacturer documentation'),
  ('diamondglow', 'mechanism', 'DiamondGlow — how the treatment works (manufacturer)', 'https://diamondglow.com/how-it-works/', 'manufacturer', 'manufacturer documentation'),
  ('diamondglow', 'primary_purpose', 'DiamondGlow — treatment overview (manufacturer)', 'https://diamondglow.com/', 'manufacturer', 'manufacturer documentation')
) as v(slug, claim_field, source_title, source_url, source_type, evidence_level)
  on v.slug = t.slug;

insert into public.comparisons (
  treatment_a_id, treatment_b_id, slug, one_sentence_difference,
  consider_a_when, consider_b_when, neither_when, common_misconception,
  publication_status, is_sample, last_reviewed_at
)
select
  a.id, b.id, 'hydrafacial-vs-diamondglow',
  'Both are professional exfoliation-plus-serum facials with essentially no downtime; HydraFacial exfoliates with water and suction, while DiamondGlow abrades the surface with a diamond-tip wand.',
  'People who prefer a water-based, non-abrasive exfoliation and generally describe their skin as sensitive or reactive commonly choose HydraFacial.',
  'People who prefer a physical, diamond-tip exfoliation and want provider-dispensed serums matched to a specific skin concern commonly choose DiamondGlow.',
  'Neither addresses wrinkle depth, skin laxity, volume loss, or scarring, and neither produces durable change on its own; people looking for those outcomes are generally discussing different categories of treatment with a licensed provider.',
  'That "medical grade" means DiamondGlow is clinically stronger or works deeper than HydraFacial. The phrase describes the distribution channel and provider-dispensed serums, not a proven difference in depth or durability of results.',
  'published', false, now()
from public.treatments a, public.treatments b
where a.slug = 'hydrafacial' and b.slug = 'diamondglow'
on conflict (slug) do nothing;
