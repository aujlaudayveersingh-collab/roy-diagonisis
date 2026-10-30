-- =============================================================================
-- MODERN DIAGNOSTIC — Migration 0004: Seed Data
-- =============================================================================
-- Seeds the initial test catalogue, categories, centres and site settings.
--
-- IMPORTANT PRICES POLICY: No prices are invented. Every seeded test has a
-- NULL price, which the website renders as "Price on request" until the owner
-- enters real prices in the admin dashboard (Manage → Tests).
-- =============================================================================

-- ---------- Centres ----------
insert into public.centres (id, name, address, phone, whatsapp, maps_url, hours, services, sort_order)
values
  (
    'dhekiajuli',
    'Dhekiajuli Centre',
    'Ward No. 4, Anil Borah Path, Opp. Style Baazar, Dhekiajuli, District Sonitpur, Assam — 784110',
    '+91 9101090862',
    '919101090862',
    'https://www.google.com/maps/search/?api=1&query=Ward+No.+4+Anil+Borah+Path+Opp+Style+Baazar+Dhekiajuli+Assam+784110',
    'Mon–Sat: 7:00 AM – 8:00 PM | Sun: 7:00 AM – 12:00 PM',
    '["Blood Tests","Home Sample Collection","Health Packages","Report Delivery"]'::jsonb,
    1
  ),
  (
    'sirajuli',
    'Sirajuli Centre',
    'NH 15, Sirajuli, Near Colony Road, Assam',
    '+91 9101090862',
    '919101090862',
    'https://www.google.com/maps/search/?api=1&query=NH+15+Sirajuli+Near+Colony+Road+Assam',
    'Mon–Sat: 7:00 AM – 8:00 PM | Sun: 7:00 AM – 12:00 PM',
    '["Blood Tests","Home Sample Collection","Health Packages","Report Delivery"]'::jsonb,
    2
  )
on conflict (id) do nothing;

-- ---------- Site settings ----------
-- Every entry is editable from Admin → Content. Values marked "[CONFIRM]"
-- contain client-supplied information that should be verified before launch.
insert into public.site_settings (key, value, label) values
(
  'brand',
  '{
    "name": "Modern Diagnostic",
    "tagline": "Accurate Diagnostics. Caring Service.",
    "logo_url": null,
    "favicon_url": null
  }'::jsonb,
  'Brand & Logo'
),
(
  'hero',
  '{
    "eyebrow": "Trusted Diagnostic Laboratory in Sonitpur, Assam",
    "headline": "Reliable diagnostic care for your family, close to home.",
    "subheadline": "Modern Diagnostic provides careful sample collection, tested processes and clear reports for everyday health checks — at our Dhekiajuli and Sirajuli centres, or from the comfort of your home.",
    "primary_cta": {"label": "Book a Test", "href": "/book"},
    "secondary_cta": {"label": "Chat on WhatsApp", "href": "whatsapp"},
    "image_url": null,
    "highlights": ["Two centres in Assam", "Home sample collection", "Easy online booking"]
  }'::jsonb,
  'Homepage Hero'
),
(
  'about',
  '{
    "headline": "A neighbourhood diagnostic laboratory built on care and consistency.",
    "mission": "To make dependable diagnostic services easily accessible to families in Dhekiajuli, Sirajuli and the surrounding communities — with honest communication at every step.",
    "body": "Modern Diagnostic was started by Pritam Roy with a simple belief: people deserve clear answers about their health, delivered with respect and without confusion. We focus on careful sample handling, well-maintained equipment and reports that are easy to understand.\n\nWe serve patients at two centres in Assam and also offer home sample collection for those who prefer to give samples at home. Our team walks you through what each test involves, how to prepare for it and when your report will be ready.",
    "commitments": [
      "Careful and hygienic sample collection",
      "Clear explanations before every test",
      "Reports shared on time",
      "Respectful treatment of every patient",
      "Convenient home sample collection"
    ],
    "image_url": null
  }'::jsonb,
  'About Us Content'
),
(
  'contact',
  '{
    "phone": "+91 9101090862",
    "whatsapp": "919101090862",
    "email": "pritamroy964@gmail.com",
    "website": "www.moderndiagnostic.com",
    "hours": "Mon–Sat: 7:00 AM – 8:00 PM | Sun: 7:00 AM – 12:00 PM",
    "owner": "Pritam Roy"
  }'::jsonb,
  'Contact Information'
),
(
  'home_collection',
  '{
    "headline": "Prefer to give samples at home?",
    "body": "Book home sample collection and our phlebotomist will visit your address at the scheduled time. It is a convenient option for elderly family members, busy schedules and follow-up tests.",
    "steps": [
      {"title": "Choose your tests", "body": "Pick the tests you need from our catalogue or health packages."},
      {"title": "Share your address", "body": "Tell us your locality and a convenient date and time slot."},
      {"title": "Sample collected at home", "body": "Our team visits your home and collects the sample with care."},
      {"title": "Get your report", "body": "Your report is prepared and shared with you as soon as it is ready."}
    ],
    "phone": "+91 9101090862",
    "whatsapp": "919101090862"
  }'::jsonb,
  'Home Sample Collection'
),
(
  'announcement',
  '{
    "enabled": true,
    "text": "Home sample collection available in Dhekiajuli & Sirajuli — call +91 9101090862 to book.",
    "link_href": "/home-collection",
    "link_label": "Learn more"
  }'::jsonb,
  'Top Announcement Bar'
),
(
  'seo',
  '{
    "meta_description": "Modern Diagnostic is a diagnostic laboratory in Dhekiajuli and Sirajuli, Assam offering blood tests, health packages and home sample collection. Book your test today.",
    "keywords": ["diagnostic laboratory Dhekiajuli","pathology lab Sirajuli","blood test Sonitpur","health checkup Assam","home sample collection Dhekiajuli","Modern Diagnostic"]
  }'::jsonb,
  'SEO Defaults'
),
(
  'social',
  '{
    "facebook": null,
    "instagram": null,
    "youtube": null
  }'::jsonb,
  'Social Links (optional)'
)
on conflict (key) do nothing;

-- ---------- Test categories ----------
insert into public.test_categories (name, slug, description, icon, colour, sort_order) values
  ('Blood Tests', 'blood-tests', 'Routine blood investigations used across many health conditions.', 'Droplets', 'brand', 1),
  ('CBC', 'cbc', 'Complete Blood Count — measures different components of your blood.', 'Activity', 'teal', 2),
  ('Thyroid Tests', 'thyroid-tests', 'Checks how well your thyroid gland is working.', 'Zap', 'brand', 3),
  ('Diabetes Tests', 'diabetes-tests', 'Blood sugar and long-term glucose level checks.', 'Gauge', 'teal', 4),
  ('Liver Function Tests', 'liver-function-tests', 'Measures enzymes and proteins that show liver health.', 'HeartPulse', 'brand', 5),
  ('Kidney Function Tests', 'kidney-function-tests', 'Checks how effectively your kidneys filter waste.', 'Droplet', 'teal', 6),
  ('Lipid Profile', 'lipid-profile', 'Measures cholesterol and triglyceride levels in your blood.', 'Heart', 'brand', 7),
  ('Health Checkups', 'health-checkups', 'Grouped checkups covering common health parameters.', 'ClipboardList', 'teal', 8)
on conflict (slug) do nothing;

-- ---------- Tests (prices intentionally NULL — set real prices in admin) ----------
insert into public.tests (category_id, name, slug, short_description, description, preparation, report_time, sample_type, is_popular, sort_order)
select
  c.id, t.name, t.slug, t.short_description, t.description, t.preparation, t.report_time, t.sample_type, t.is_popular, t.sort_order
from (values
  ('blood-tests', 'Blood Group & Rh Typing', 'blood-group-rh-typing', 'Determines your blood group and Rh factor.', 'Identifies the ABO blood group and Rh (D) factor of your blood. Useful before donation, during pregnancy planning and before surgery.', 'No fasting required.', 'Same day', 'Blood', false, 1),
  ('blood-tests', 'ESR (Westergren)', 'esr-westergren', 'Measures how quickly red blood cells settle in one hour.', 'The Erythrocyte Sedimentation Rate is a general indicator of inflammation in the body and is often advised alongside other tests.', 'No fasting required.', 'Same day', 'Blood', false, 2),
  ('blood-tests', 'Peripheral Smear Examination', 'peripheral-smear', 'Microscopic study of blood cells.', 'A blood smear is examined under a microscope to study the shape, size and number of blood cells.', 'No fasting required.', 'Same day', 'Blood', false, 3),
  ('cbc', 'CBC (Complete Blood Count)', 'cbc-complete-blood-count', 'Measures red cells, white cells, haemoglobin and platelets.', 'A Complete Blood Count is one of the most commonly advised blood tests. It gives an overall picture of your blood cells and is used as a starting point for many health evaluations.', 'No fasting required.', 'Same day', 'Blood', true, 1),
  ('cbc', 'CBC with Differential (TC/DC)', 'cbc-with-differential', 'CBC along with white blood cell differential count.', 'Extends the Complete Blood Count with a differential count, which shows the percentage of each type of white blood cell.', 'No fasting required.', 'Same day', 'Blood', false, 2),
  ('thyroid-tests', 'Thyroid Profile (T3, T4, TSH)', 'thyroid-profile-t3-t4-tsh', 'Measures T3, T4 and TSH levels together.', 'A combined check of the thyroid hormones T3 and T4 along with Thyroid Stimulating Hormone, used to assess thyroid function.', 'No fasting required. Inform us if you are on thyroid medication.', 'Same day', 'Serum', true, 1),
  ('thyroid-tests', 'TSH (Thyroid Stimulating Hormone)', 'tsh-only', 'Screens how the thyroid gland is responding.', 'TSH is produced by the pituitary gland and controls thyroid activity. A single TSH check is often used for screening and follow-up.', 'No fasting required.', 'Same day', 'Serum', false, 2),
  ('thyroid-tests', 'Anti TPO Antibody', 'anti-tpo-antibody', 'Checks for antibodies linked to thyroid inflammation.', 'This test looks for antibodies against thyroid peroxidase, which may be advised when thyroid disorder is suspected.', 'No fasting required.', 'As advised', 'Serum', false, 3),
  ('diabetes-tests', 'Blood Sugar Fasting (BSF)', 'blood-sugar-fasting', 'Measures blood sugar after an overnight fast.', 'Glucose level in blood measured after 8–10 hours of fasting. Frequently used in routine health checkups and diabetes monitoring.', 'Fast for 8–10 hours before the sample. Water is allowed.', 'Same day', 'Plasma', true, 1),
  ('diabetes-tests', 'Blood Sugar Random (BSR)', 'blood-sugar-random', 'Measures blood sugar at any time of day.', 'Glucose level measured without fasting at the time of collection. Advised when symptoms are present or as advised by a doctor.', 'No fasting required.', 'Same day', 'Plasma', false, 2),
  ('diabetes-tests', 'Blood Sugar Post Prandial (PPBS)', 'blood-sugar-post-prandial', 'Measures blood sugar after a meal.', 'Glucose level measured two hours after a meal, used to see how the body handles sugar after eating.', 'Sample is given 2 hours after a full meal.', 'Same day', 'Plasma', false, 3),
  ('diabetes-tests', 'HbA1c (Glycated Haemoglobin)', 'hba1c', 'Shows average blood sugar over the last 3 months.', 'HbA1c reflects your average blood glucose over roughly the previous three months and is commonly used in diabetes review.', 'No fasting required.', 'Same day', 'Blood', true, 4),
  ('liver-function-tests', 'Liver Function Test (LFT)', 'liver-function-test', 'Measures liver enzymes, bilirubin and proteins.', 'A group of blood tests that together give information about the condition of your liver, including how well it is working.', 'Preferably fasting for 8–10 hours. Follow your doctor''s advice.', 'Same day', 'Serum', true, 1),
  ('liver-function-tests', 'SGPT / ALT', 'sgpt-alt', 'Measures an enzyme found mainly in the liver.', 'Alanine aminotransferase is a liver enzyme; elevated levels may suggest liver inflammation. Usually advised as part of a liver panel.', 'No fasting required.', 'Same day', 'Serum', false, 2),
  ('kidney-function-tests', 'Kidney Function Test (KFT / RFT)', 'kidney-function-test', 'Measures creatinine, urea and electrolytes.', 'A set of blood tests that gives information about how well your kidneys are filtering waste from your blood.', 'Preferably fasting for 8–10 hours. Follow your doctor''s advice.', 'Same day', 'Serum', true, 1),
  ('kidney-function-tests', 'Serum Creatinine', 'serum-creatinine', 'Measures a waste product filtered by the kidneys.', 'Creatinine is a waste product of muscle activity; its level in blood is used as one indicator of kidney function.', 'No fasting required.', 'Same day', 'Serum', false, 2),
  ('kidney-function-tests', 'Blood Urea / BUN', 'blood-urea-bun', 'Measures urea nitrogen in the blood.', 'Urea is produced as the body breaks down protein; blood levels are used along with other tests to assess kidney status.', 'No fasting required.', 'Same day', 'Serum', false, 3),
  ('lipid-profile', 'Lipid Profile (Cholesterol)', 'lipid-profile-cholesterol', 'Measures total cholesterol, HDL, LDL and triglycerides.', 'A lipid profile measures different types of cholesterol and triglycerides, commonly advised for heart health assessment.', 'Preferably fasting for 9–12 hours. Follow your doctor''s advice.', 'Same day', 'Serum', true, 1),
  ('lipid-profile', 'Cholesterol Total', 'cholesterol-total', 'Measures total cholesterol in the blood.', 'A single measurement of total cholesterol. Often ordered with other lipid parameters for a fuller picture.', 'Preferably fasting for 9–12 hours.', 'Same day', 'Serum', false, 2),
  ('health-checkups', 'Fever Profile (Basic)', 'fever-profile-basic', 'A basic set of tests often advised during fever.', 'A grouped set of investigations commonly suggested by doctors when a patient presents with fever. Final test selection should follow your doctor''s advice.', 'No fasting required.', 'Same day', 'Blood / Urine', true, 1),
  ('health-checkups', 'Diabetes Profile (Sugar)', 'diabetes-profile-sugar', 'Fasting and post-meal sugar tested together.', 'A combination of fasting and post-prandial blood sugar checks, commonly used in diabetes screening and review.', 'Fast for 8–10 hours before the fasting sample.', 'Same day', 'Plasma', false, 2)
) as t(category_slug, name, slug, short_description, description, preparation, report_time, sample_type, is_popular, sort_order)
join public.test_categories c on c.slug = t.category_slug
on conflict (slug) do nothing;

-- ---------- Example package (draft, NOT published) ----------
-- Left unpublished with a NULL price so the owner can complete it in admin.
insert into public.packages (name, slug, description, long_description, price, mrp, test_count, fasting_required, report_time, includes, is_published, sort_order)
values (
  'Basic Health Checkup',
  'basic-health-checkup',
  'A starter package covering common health parameters.',
  'A basic package for routine health review. Edit this package in Admin → Packages to add the exact tests included, set the real price and publish it when ready.',
  null, null, 4, true, 'Same day',
  '["Complete Blood Count (CBC)","Blood Sugar Fasting","Lipid Profile","Urine Routine"]'::jsonb,
  false, 1
) on conflict (slug) do nothing;
