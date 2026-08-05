-- Focused comparison-content pass. These summaries synthesize facts already
-- present in the source-backed treatment profiles; no treatment facts or
-- source records are introduced here.

with payload (
  slug,
  meta_description,
  bottom_line
) as (
  values
    (
      'botox-vs-dysport',
      'Compare Botox Cosmetic and Dysport by labelled uses, onset, duration, downtime, risks, non-interchangeable units, and pricing basis.',
      'Botox Cosmetic and Dysport are both prescription botulinum toxin type A products that temporarily reduce activity in injected muscles, but they are different formulations with non-interchangeable potency units and product-specific labels. Botox Cosmetic''s current US cosmetic label covers several facial and neck line indications, while Dysport''s US cosmetic label is narrower and centers on glabellar lines. Neither product adds volume or has an immediate reversal agent. Onset, duration, unwanted weakness, and the visible result vary with the treated area, dose, anatomy, and injection technique. Compare quoted prices only within the same product and treatment plan; a lower raw per-unit price does not establish an equivalent dose or total treatment cost.'
    ),
    (
      'botox-vs-dermal-fillers',
      'Compare Botox Cosmetic with hyaluronic acid dermal fillers: muscle activity versus added volume, reversibility, risks, downtime, and pricing.',
      'Botox Cosmetic and hyaluronic acid dermal fillers address different mechanisms rather than serving as direct substitutes. Botox temporarily reduces selected muscle activity and is commonly discussed for movement-related expression lines. HA fillers place gel beneath the skin to add or restore volume, shape, or structural support for a product-specific approved area. Botox does not fill a hollow, and filler does not relax the muscle activity that creates a dynamic line. Botox has no immediate reversal agent; many HA fillers may be reduced with hyaluronidase, although the result can be incomplete and the process has its own risks. Suitability, product choice, treatment area, dose or syringe quantity, and total price all depend on an individual assessment and provider technique.'
    ),
    (
      'juvederm-vs-restylane',
      'Compare Juvéderm and Restylane filler families by product range, labelled treatment areas, longevity, reversibility, risks, and syringe pricing.',
      'Juvéderm and Restylane are families of hyaluronic acid fillers, not single interchangeable products. Each family contains formulations with different textures, technologies, labelled treatment areas, and expected behavior. A useful comparison therefore begins with the exact products and anatomical goal—for example, a lip product should not be evaluated as though it were a cheek or chin product. Both families add gel volume and may be treated with hyaluronidase, but reversal is not guaranteed to restore the original result or remove every risk. Longevity, swelling, contour, and the amount required vary by product, placement, anatomy, and technique. Compare pricing per named syringe and planned treatment course, not by brand-family averages alone.'
    ),
    (
      'juvederm-voluma-vs-restylane-kysse',
      'Compare Juvéderm Voluma XC and Restylane Kysse by labelled treatment area, purpose, longevity, reversibility, risks, and syringe pricing.',
      'Juvéderm Voluma XC and Restylane Kysse are both hyaluronic acid fillers, but their labelled purposes make them a deliberately mismatched comparison. Voluma XC is a structural filler with US indications that include cheek, chin, and temple augmentation, while Kysse is labelled for lip augmentation and upper-perioral lines. They therefore should not be treated as interchangeable options for one anatomical goal. Both add gel volume and may be reduced with hyaluronidase, but correction is not guaranteed and vascular or other injection complications remain possible. Product selection, amount, injection plane, expected longevity, and price depend heavily on the treatment area, anatomy, and provider technique.'
    ),
    (
      'sculptra-vs-radiesse',
      'Compare Sculptra and Radiesse by material, immediate versus gradual effects, treatment course, reversibility, risks, and pricing basis.',
      'Sculptra and Radiesse are injectable products with collagen-stimulating effects, but they do not create the same timing or handling profile. Sculptra uses poly-L-lactic acid particles and is generally described as producing gradual change over a treatment course; its early post-injection fullness is largely related to the diluent rather than the final result. Radiesse is a calcium hydroxylapatite filler that can provide immediate structural volume from its gel carrier while also supporting a longer tissue response. Neither product is dissolved with hyaluronidase. Treatment area, preparation, placement, number of sessions, and total cost vary, and both require provider judgment because nodules, vascular injury, and unsatisfactory contour are among the important risks or limitations.'
    ),
    (
      'thermage-vs-ultherapy',
      'Compare Thermage FLX and Ultherapy by energy type, treatment depth, result timing, downtime, limitations, risks, and area-based pricing.',
      'Thermage FLX and Ultherapy are noninvasive energy-device treatments discussed for modest tightening or lifting goals, but they deliver energy differently. Thermage uses monopolar radiofrequency to heat tissue, while Ultherapy uses microfocused ultrasound with real-time imaging to target selected tissue depths. Neither device adds volume, and neither should be expected to reproduce a surgical lift. Results develop gradually and can be subtle; discomfort, swelling, the treated area, and duration vary. Device authenticity, tip or transducer selection, settings, number of passes or lines, anatomy, and provider technique materially affect the treatment. Pricing should be compared by device generation, anatomical area, and complete protocol rather than by a single session label alone.'
    ),
    (
      'morpheus8-vs-potenza',
      'Compare Morpheus8 and Potenza RF microneedling by handpieces, energy delivery, protocols, downtime, risks, and session pricing.',
      'Morpheus8 and Potenza are radiofrequency microneedling platforms that combine needle penetration with RF energy, but a brand name alone does not define the treatment delivered. The systems differ in available handpieces, needle configurations, energy modes, software, and cleared indications, while depth, power, passes, and treatment area are selected by the provider. Both can involve redness, swelling, pinpoint bleeding, pigment change, burns, scarring, infection, or unintended tissue effects when treatment is inappropriate or aggressive. Results and downtime therefore depend more on the exact protocol and patient factors than on a simple device ranking. Compare quotes only when the area, number of sessions, tips, anesthesia, and included aftercare are comparable.'
    ),
    (
      'hydrafacial-vs-diamondglow',
      'Compare HydraFacial and DiamondGlow by exfoliation method, suction, topical delivery, downtime, limitations, and session pricing.',
      'HydraFacial and DiamondGlow are branded superficial facial procedures that combine exfoliation, suction or extraction, and topical solution delivery, but they use different handpieces and resurfacing methods. HydraFacial uses a proprietary fluid-and-suction pathway, while DiamondGlow uses a diamond-tip dermabrasion handpiece with simultaneous suction and topical infusion. Both are intended for temporary surface-level improvements such as smoother texture and a hydrated appearance; neither adds structural volume, relaxes muscles, or produces deep tissue tightening. Results are usually assessed immediately, but durable longevity is not established in this content set. Skin condition, suction or abrasion intensity, solution choice, hygiene, protocol tier, and add-ons remain provider-dependent. Compare prices by full protocol, treatment area, session length, and included products.'
    )
)
update public.comparisons comparison
set
  description_override = payload.meta_description,
  one_sentence_difference = payload.bottom_line,
  last_verified_at = '2026-08-05T00:00:00Z'::timestamptz,
  updated_at = now()
from payload
where comparison.slug = payload.slug
  and comparison.publication_status = 'published'
  and comparison.is_sample = false;

do $$
declare
  completed_count integer;
begin
  select count(*)
  into completed_count
  from public.comparisons
  where slug = any(array[
    'botox-vs-dysport',
    'botox-vs-dermal-fillers',
    'juvederm-vs-restylane',
    'juvederm-voluma-vs-restylane-kysse',
    'sculptra-vs-radiesse',
    'thermage-vs-ultherapy',
    'morpheus8-vs-potenza',
    'hydrafacial-vs-diamondglow'
  ])
    and publication_status = 'published'
    and is_sample = false
    and one_sentence_difference is not null;

  if completed_count <> 8 then
    raise exception 'Expected eight published comparison summaries; found %', completed_count;
  end if;
end
$$;
