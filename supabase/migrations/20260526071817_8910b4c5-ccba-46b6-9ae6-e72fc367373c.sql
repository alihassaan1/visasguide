INSERT INTO public.etias_country_pages (country_slug, country_name, nationality, intro, who_qualifies, special_notes, processing_details, faqs, seo_title, seo_description, featured_image_url, is_published, published_at) VALUES
(
  'united-states', 'United States', 'American',
  'From late 2026, US passport holders will need ETIAS to enter any of the 30 Schengen countries for tourism, business, or transit. The €20 authorisation is valid for up to 3 years and replaces nothing — Americans still travel visa-free, but the pre-screening is now mandatory.',
  'Every US passport holder travelling to a Schengen country for stays of up to 90 days in any 180-day period needs ETIAS. That includes infants, children, and seniors — though under-18s and over-70s pay no fee. Dual nationals can apply with whichever passport they plan to use at the border.',
  'Americans should apply at least 96 hours before flying, but ideally 2–4 weeks ahead. The biggest tripping point for US applicants is the background-question section: prior misdemeanours (including DUIs older than 10 years) generally do not bar ETIAS approval, but recent arrests should be disclosed accurately. Active US passports issued before 2007 may lack the biometric chip required by ETIAS — check the chip symbol on the front cover before applying.',
  'Most US applications are approved within minutes. Manual review is more common for applicants who have travelled to sanctioned countries (Iran, Syria, North Korea) in the last 10 years, or who have a prior Schengen visa refusal on record. Allow up to 30 days for those cases.',
  '[{"question":"Do I need ETIAS if I already have a US passport?","answer":"Yes. ETIAS is required in addition to your passport — it''s not a visa, but it is a mandatory pre-travel authorisation."},{"question":"Does ETIAS apply to US travel to the UK?","answer":"No. The UK is not in Schengen and uses its own UK ETA system."},{"question":"How long can I stay in Europe with ETIAS?","answer":"Up to 90 days in any 180-day rolling period across the Schengen area."},{"question":"Will TSA Global Entry help me skip ETIAS?","answer":"No. ETIAS is an EU system and is unaffected by US trusted-traveller programmes."}]'::jsonb,
  'ETIAS for US Citizens 2026 — €20 Fee, Eligibility & How to Apply',
  'Complete ETIAS guide for US passport holders: €20 fee, 3-year validity, application steps, and what changes for Americans travelling to Europe in 2026.',
  'https://images.unsplash.com/photo-1543832923-44667a44c804?w=1200&h=630&fit=crop&q=80',
  true, now()
),
(
  'united-kingdom', 'United Kingdom', 'British',
  'Post-Brexit, UK passport holders are visa-waiver nationals in the EU and from late 2026 will need ETIAS to enter the 30 Schengen countries. The €20 authorisation is valid for up to 3 years and is required for tourism, business, transit, and short stays.',
  'All British citizens, including dual nationals using a UK passport at the EU border. British Nationals (Overseas), British Overseas Citizens, and British Subjects without right of abode have different requirements — most still need a Schengen visa, not ETIAS.',
  'British travellers are among the highest-volume ETIAS applicants worldwide. The Common Travel Area between the UK and Ireland is unaffected — Ireland is not in Schengen and uses no ETIAS. Crossings into the Republic of Ireland from Northern Ireland remain frictionless. Watch for passport validity: your UK passport must have been issued less than 10 years before your arrival date in Schengen, a rule that has tripped up many Britons since Brexit.',
  'Approval is usually instant for UK passport holders. Manual review is triggered most often by passport issues (over-10-years rule), name mismatches with prior Schengen visas, or unresolved prior overstays.',
  '[{"question":"Do I need ETIAS if I''m only visiting Ireland?","answer":"No. Ireland is outside Schengen and outside ETIAS. The Common Travel Area continues to operate as before."},{"question":"What about cruise stops in Schengen ports?","answer":"Yes, you need ETIAS for cruise disembarkation in any Schengen country, even for a few hours ashore."},{"question":"Can I use my old EU red passport for ETIAS?","answer":"Only if it''s still valid and was issued less than 10 years before your arrival date — otherwise renew first."},{"question":"Does ETIAS affect UK-EU business travel?","answer":"Yes — ETIAS covers short business trips up to 90 days. Long-term work still requires a national work permit from the relevant member state."}]'::jsonb,
  'ETIAS for UK Citizens 2026 — €20 Fee, British Passport Rules',
  'ETIAS guide for UK passport holders post-Brexit: €20 fee, passport validity rules, Ireland exemption, and full application walkthrough.',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=630&fit=crop&q=80',
  true, now()
),
(
  'canada', 'Canada', 'Canadian',
  'Canadian passport holders enjoy visa-free entry to Europe for short stays, and from late 2026 will need ETIAS — a €20 online authorisation valid for up to 3 years. It applies to tourism, business, transit, and family visits across the 30 Schengen countries.',
  'All Canadian citizens, regardless of age. Permanent residents of Canada without Canadian citizenship are not automatically eligible — eligibility depends on the passport you hold, not your country of residence. Dual Canadian-EU nationals should travel on their EU passport to avoid ETIAS entirely.',
  'Canadians travel to Europe in high numbers, particularly to France, Italy, Germany, and Greece. The application process is the same regardless of province. Quebec residents see the application in English by default — language selection happens early in the form. Make sure the name on your application exactly matches your passport, accents and hyphens included.',
  'Auto-approval is the norm. Manual review is most common for Canadians with prior travel to countries on the EU''s watch list, or for naturalised Canadians whose country of birth requires extra screening.',
  '[{"question":"Do Canadian PRs need ETIAS?","answer":"It depends on your passport, not your residency. If you travel on a passport from an ETIAS-eligible country, you need ETIAS. If your passport requires a Schengen visa, apply for that instead."},{"question":"Can I apply for ETIAS in French?","answer":"Yes. The official portal supports all EU official languages, including French."},{"question":"Will ETIAS replace my passport stamp?","answer":"Largely yes — the Entry/Exit System replaces stamping with biometric registration. ETIAS is the pre-travel authorisation layer on top."}]'::jsonb,
  'ETIAS for Canadian Citizens 2026 — Complete Application Guide',
  'ETIAS guide for Canadian passport holders: €20 fee, 3-year validity, application in English or French, and what changes for Canada-Europe travel.',
  'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=630&fit=crop&q=80',
  true, now()
),
(
  'australia', 'Australia', 'Australian',
  'Australian passport holders will need ETIAS from late 2026 to enter any of the 30 Schengen countries for short stays. The €20 authorisation is valid up to 3 years and covers tourism, business, transit, and family visits — but not work or long-term study.',
  'All Australian citizens. Subclass holders, permanent residents, and bridging-visa holders without Australian citizenship are not eligible via ETIAS — your passport country governs your route.',
  'Australians often combine Europe trips with longer working-holiday plans across multiple countries. ETIAS only covers 90 days in any 180-day window across the entire Schengen zone — country-hopping does not reset the clock. If you plan to stay longer, you need a long-stay national visa from your primary destination country. The Working Holiday agreements Australia has with France, Germany, Italy, and others are separate from ETIAS.',
  'Approval is usually within minutes. Manual review is most common for travellers who have visited conflict zones or have outstanding immigration matters in another country.',
  '[{"question":"Does ETIAS work with Australian working-holiday visas?","answer":"No — they''re separate systems. ETIAS is for stays under 90 days; working-holiday is a national long-stay visa from a specific country."},{"question":"Do I need ETIAS to transit through a Schengen airport?","answer":"Yes, if you leave the international transit zone. Even short stopovers in Frankfurt, Paris, or Amsterdam require ETIAS for Australian travellers."},{"question":"What about travel to the UK from Australia?","answer":"UK trips use the UK ETA, not ETIAS. They''re separate, but you''ll likely need both if you''re visiting both regions."}]'::jsonb,
  'ETIAS for Australian Citizens 2026 — Application Guide & Fees',
  'ETIAS guide for Australian passport holders: €20 fee, transit rules, 90/180 day limit, and how it interacts with working-holiday visas.',
  'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200&h=630&fit=crop&q=80',
  true, now()
),
(
  'japan', 'Japan', 'Japanese',
  'Japanese passport holders are among the most-travelled in Europe and from late 2026 will need ETIAS — a €20 online authorisation valid up to 3 years — to enter the 30 Schengen countries for short stays.',
  'All Japanese citizens. The Japanese passport ranks among the strongest in the world; ETIAS does not change visa-waiver status, only adds a pre-travel registration step.',
  'The ETIAS portal is available in Japanese. Japanese applicants typically face very low manual-review rates. Watch for romanisation — enter your name on the application exactly as it appears on the passport machine-readable zone (MRZ), not the kanji version. Mismatches between the Latin script on your ETIAS and your passport are the leading cause of border delays for Japanese travellers.',
  'Almost all Japanese applicants are approved within minutes. The strong cooperation between Japanese and EU authorities means database hits are rare.',
  '[{"question":"Is the ETIAS form available in Japanese?","answer":"Yes. The official portal supports Japanese throughout the application flow."},{"question":"Do I need ETIAS for a transit through Schengen?","answer":"Yes, if you leave the international zone — common at airports like Frankfurt, Amsterdam, and Paris CDG."},{"question":"My name has hyphens in passport — do I keep them?","answer":"Use the spelling exactly as in the MRZ at the bottom of your passport page. That''s what the EU border system compares against."}]'::jsonb,
  'ETIAS for Japanese Citizens 2026 — €20 Online Application',
  'ETIAS guide for Japanese passport holders: €20 fee, Japanese-language application, transit rules, and 3-year validity from 2026.',
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&h=630&fit=crop&q=80',
  true, now()
);

INSERT INTO public.news_articles (title, slug, excerpt, content, tags, categories, featured_image_url, writer_id, author, source_type, status, ai_generated, published_at, seo_title, seo_description) VALUES
(
  'ETIAS Launch Confirmed for Q4 2026 — What Travellers Need to Know',
  'etias-launch-q4-2026-confirmed',
  'The European Commission has confirmed the €20 ETIAS authorisation will go live in the final quarter of 2026, ending years of delays.',
  E'After multiple delays stretching back to 2018, the European Commission has confirmed that ETIAS — the European Travel Information and Authorisation System — will launch in the fourth quarter of 2026. Travellers from around 60 visa-waiver countries will need the €20 pre-travel authorisation to enter any of the 30 Schengen-area nations.\n\nThe rollout will include a six-month transitional period during which entry without ETIAS will still be permitted, giving airlines, border agencies, and travellers time to adjust. After that, ETIAS will be strictly enforced — passengers without a valid authorisation will be denied boarding at the airline check-in.\n\nThe €20 fee, valid for up to three years or until passport expiry, applies to everyone aged 18 to 70. Children and seniors are exempt from the fee but must still apply. The only official portal will be travel-europe.europa.eu/etias, and the EU is already warning travellers about scam sites charging inflated fees.',
  ARRAY['etias','europe','schengen','2026'],
  ARRAY['ETIAS','News'],
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&h=630&fit=crop&q=80',
  '24c758f4-601b-477d-9049-5878bb4622ff', 'James Chen',
  'manual', 'published', false, now() - interval '3 days',
  'ETIAS Launch Confirmed for Q4 2026 — Official EU Announcement',
  'The €20 ETIAS authorisation will go live in Q4 2026 after years of delays. What travellers need to know about the rollout and transitional period.'
),
(
  'Beware ETIAS Scam Websites — Fake Portals Already Collecting Personal Data',
  'etias-scam-websites-warning-2026',
  'Dozens of fake ETIAS sites are charging €40–€90 and harvesting passport details ahead of the official 2026 launch. Here''s how to spot them.',
  E'With the ETIAS launch approaching, fraudulent websites impersonating the official EU portal are already collecting personal and passport data from would-be travellers. Some charge €40 to €90 — double or quadruple the official €20 fee — and offer fake "express processing" that does not exist.\n\nThe only legitimate ETIAS site is travel-europe.europa.eu/etias. Official communications come from EU domains ending in .europa.eu. Any website using "official" or "fast-track" branding without that domain is a third-party reseller at best, and a scam at worst.\n\nWarning signs include: prices above €20, promises of guaranteed approval, requests for documents beyond a passport scan, and high-pressure language about urgent travel. If you''ve already paid one of these sites, contact your bank to dispute the charge and monitor your passport details for misuse.',
  ARRAY['etias','scam','security','europe'],
  ARRAY['ETIAS','News'],
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=630&fit=crop&q=80',
  '473dc28d-1b7c-4d9b-a971-34df500b5165', 'Sarah Mitchell',
  'manual', 'published', false, now() - interval '1 day',
  'ETIAS Scam Sites Warning 2026 — How to Spot Fake Portals',
  'Fake ETIAS websites are charging €40-€90 and harvesting passport data. Learn the official URL and how to spot scam sites before paying.'
),
(
  'How ETIAS Compares to UK ETA and US ESTA — A Traveller''s Side-by-Side',
  'etias-vs-uk-eta-vs-us-esta-comparison',
  'ETIAS joins a growing global club of pre-travel authorisations. How do the EU''s €20 system, the UK ETA, and the US ESTA actually stack up?',
  E'Pre-travel authorisations are becoming the default for short visits. With ETIAS launching in late 2026, travellers from major visa-waiver countries will need to manage three separate systems — ETIAS for Schengen, UK ETA for Britain, and ESTA for the United States.\n\nETIAS costs €20 and is valid for up to three years. UK ETA costs £16 and lasts two years. US ESTA costs $21 and is valid for two years. All three are online applications that take under 30 minutes, all three are linked to the passport, and all three require renewal when the passport is replaced.\n\nThe systems do not talk to each other. Approval in one has no bearing on the others. Refusal in one, however, can trigger additional scrutiny in the others — particularly between ESTA and ETIAS, which share some watch-list data via Interpol channels.\n\nFor frequent transatlantic travellers, the practical takeaway is to budget around €40–€50 per year across all three systems, and to apply for each well before travel rather than at the airport.',
  ARRAY['etias','uk-eta','esta','comparison','europe'],
  ARRAY['ETIAS','Travel Authorisation'],
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&fit=crop&q=80',
  'ae8f1c7d-77f6-4026-8c4e-eb14b2808aaf', 'Priya Sharma',
  'manual', 'published', false, now() - interval '5 days',
  'ETIAS vs UK ETA vs US ESTA — Side-by-Side Comparison 2026',
  'How the EU ETIAS, UK ETA, and US ESTA compare: fees, validity, application process, and what travellers need to manage all three.'
);