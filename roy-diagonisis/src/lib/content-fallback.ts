// =============================================================================
// Content fallbacks — used when Supabase is not yet configured so the public
// site always renders something meaningful. These mirror the seeded DB rows.
// Once Supabase is connected, live data takes priority.
// =============================================================================
import type { Category, Package, Test, Testimonial } from '@/lib/types';

export const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cat-blood', name: 'Blood Tests', slug: 'blood-tests', description: 'Routine blood investigations used across many health conditions.', icon: 'Droplets', colour: 'brand', sort_order: 1, is_active: true },
  { id: 'cat-cbc', name: 'CBC', slug: 'cbc', description: 'Complete Blood Count — measures different components of your blood.', icon: 'Activity', colour: 'teal', sort_order: 2, is_active: true },
  { id: 'cat-thyroid', name: 'Thyroid Tests', slug: 'thyroid-tests', description: 'Checks how well your thyroid gland is working.', icon: 'Zap', colour: 'brand', sort_order: 3, is_active: true },
  { id: 'cat-diabetes', name: 'Diabetes Tests', slug: 'diabetes-tests', description: 'Blood sugar and long-term glucose level checks.', icon: 'Gauge', colour: 'teal', sort_order: 4, is_active: true },
  { id: 'cat-lft', name: 'Liver Function Tests', slug: 'liver-function-tests', description: 'Measures enzymes and proteins that show liver health.', icon: 'HeartPulse', colour: 'brand', sort_order: 5, is_active: true },
  { id: 'cat-kft', name: 'Kidney Function Tests', slug: 'kidney-function-tests', description: 'Checks how effectively your kidneys filter waste.', icon: 'Droplet', colour: 'teal', sort_order: 6, is_active: true },
  { id: 'cat-lipid', name: 'Lipid Profile', slug: 'lipid-profile', description: 'Measures cholesterol and triglyceride levels in your blood.', icon: 'Heart', colour: 'brand', sort_order: 7, is_active: true },
  { id: 'cat-health', name: 'Health Checkups', slug: 'health-checkups', description: 'Grouped checkups covering common health parameters.', icon: 'ClipboardList', colour: 'teal', sort_order: 8, is_active: true },
];

const t = (
  cat: string, name: string, slug: string, short: string, desc: string,
  prep: string, report: string, sample: string, popular: boolean, order: number, price: number | null = null
): Test => ({
  id: `test-${slug}`, category_id: cat, name, slug, short_description: short,
  description: desc, price, mrp: null, preparation: prep, report_time: report,
  sample_type: sample, is_popular: popular, is_active: true, sort_order: order,
});

export const FALLBACK_TESTS: Test[] = [
  t('cat-blood', 'Blood Group & Rh Typing', 'blood-group-rh-typing', 'Determines your blood group and Rh factor.', 'Identifies the ABO blood group and Rh (D) factor of your blood. Useful before donation, during pregnancy planning and before surgery.', 'No fasting required.', 'Same day', 'Blood', false, 1),
  t('cat-blood', 'ESR (Westergren)', 'esr-westergren', 'Measures how quickly red blood cells settle in one hour.', 'The Erythrocyte Sedimentation Rate is a general indicator of inflammation in the body and is often advised alongside other tests.', 'No fasting required.', 'Same day', 'Blood', false, 2),
  t('cat-blood', 'Peripheral Smear Examination', 'peripheral-smear', 'Microscopic study of blood cells.', 'A blood smear is examined under a microscope to study the shape, size and number of blood cells.', 'No fasting required.', 'Same day', 'Blood', false, 3),
  t('cat-cbc', 'CBC (Complete Blood Count)', 'cbc-complete-blood-count', 'Measures red cells, white cells, haemoglobin and platelets.', 'A Complete Blood Count is one of the most commonly advised blood tests. It gives an overall picture of your blood cells and is used as a starting point for many health evaluations.', 'No fasting required.', 'Same day', 'Blood', true, 1),
  t('cat-cbc', 'CBC with Differential (TC/DC)', 'cbc-with-differential', 'CBC along with white blood cell differential count.', 'Extends the Complete Blood Count with a differential count, which shows the percentage of each type of white blood cell.', 'No fasting required.', 'Same day', 'Blood', false, 2),
  t('cat-thyroid', 'Thyroid Profile (T3, T4, TSH)', 'thyroid-profile-t3-t4-tsh', 'Measures T3, T4 and TSH levels together.', 'A combined check of the thyroid hormones T3 and T4 along with Thyroid Stimulating Hormone, used to assess thyroid function.', 'No fasting required. Inform us if you are on thyroid medication.', 'Same day', 'Serum', true, 1),
  t('cat-thyroid', 'TSH (Thyroid Stimulating Hormone)', 'tsh-only', 'Screens how the thyroid gland is responding.', 'TSH is produced by the pituitary gland and controls thyroid activity. A single TSH check is often used for screening and follow-up.', 'No fasting required.', 'Same day', 'Serum', false, 2),
  t('cat-thyroid', 'Anti TPO Antibody', 'anti-tpo-antibody', 'Checks for antibodies linked to thyroid inflammation.', 'This test looks for antibodies against thyroid peroxidase, which may be advised when thyroid disorder is suspected.', 'No fasting required.', 'As advised', 'Serum', false, 3),
  t('cat-diabetes', 'Blood Sugar Fasting (BSF)', 'blood-sugar-fasting', 'Measures blood sugar after an overnight fast.', 'Glucose level in blood measured after 8–10 hours of fasting. Frequently used in routine health checkups and diabetes monitoring.', 'Fast for 8–10 hours before the sample. Water is allowed.', 'Same day', 'Plasma', true, 1),
  t('cat-diabetes', 'Blood Sugar Random (BSR)', 'blood-sugar-random', 'Measures blood sugar at any time of day.', 'Glucose level measured without fasting at the time of collection. Advised when symptoms are present or as advised by a doctor.', 'No fasting required.', 'Same day', 'Plasma', false, 2),
  t('cat-diabetes', 'Blood Sugar Post Prandial (PPBS)', 'blood-sugar-post-prandial', 'Measures blood sugar after a meal.', 'Glucose level measured two hours after a meal, used to see how the body handles sugar after eating.', 'Sample is given 2 hours after a full meal.', 'Same day', 'Plasma', false, 3),
  t('cat-diabetes', 'HbA1c (Glycated Haemoglobin)', 'hba1c', 'Shows average blood sugar over the last 3 months.', 'HbA1c reflects your average blood glucose over roughly the previous three months and is commonly used in diabetes review.', 'No fasting required.', 'Same day', 'Blood', true, 4),
  t('cat-lft', 'Liver Function Test (LFT)', 'liver-function-test', 'Measures liver enzymes, bilirubin and proteins.', 'A group of blood tests that together give information about the condition of your liver, including how well it is working.', 'Preferably fasting for 8–10 hours. Follow your doctor’s advice.', 'Same day', 'Serum', true, 1),
  t('cat-lft', 'SGPT / ALT', 'sgpt-alt', 'Measures an enzyme found mainly in the liver.', 'Alanine aminotransferase is a liver enzyme; elevated levels may suggest liver inflammation. Usually advised as part of a liver panel.', 'No fasting required.', 'Same day', 'Serum', false, 2),
  t('cat-kft', 'Kidney Function Test (KFT / RFT)', 'kidney-function-test', 'Measures creatinine, urea and electrolytes.', 'A set of blood tests that gives information about how well your kidneys are filtering waste from your blood.', 'Preferably fasting for 8–10 hours. Follow your doctor’s advice.', 'Same day', 'Serum', true, 1),
  t('cat-kft', 'Serum Creatinine', 'serum-creatinine', 'Measures a waste product filtered by the kidneys.', 'Creatinine is a waste product of muscle activity; its level in blood is used as one indicator of kidney function.', 'No fasting required.', 'Same day', 'Serum', false, 2),
  t('cat-kft', 'Blood Urea / BUN', 'blood-urea-bun', 'Measures urea nitrogen in the blood.', 'Urea is produced as the body breaks down protein; blood levels are used along with other tests to assess kidney status.', 'No fasting required.', 'Same day', 'Serum', false, 3),
  t('cat-lipid', 'Lipid Profile (Cholesterol)', 'lipid-profile-cholesterol', 'Measures total cholesterol, HDL, LDL and triglycerides.', 'A lipid profile measures different types of cholesterol and triglycerides, commonly advised for heart health assessment.', 'Preferably fasting for 9–12 hours. Follow your doctor’s advice.', 'Same day', 'Serum', true, 1),
  t('cat-lipid', 'Cholesterol Total', 'cholesterol-total', 'Measures total cholesterol in the blood.', 'A single measurement of total cholesterol. Often ordered with other lipid parameters for a fuller picture.', 'Preferably fasting for 9–12 hours.', 'Same day', 'Serum', false, 2),
  t('cat-health', 'Fever Profile (Basic)', 'fever-profile-basic', 'A basic set of tests often advised during fever.', 'A grouped set of investigations commonly suggested by doctors when a patient presents with fever. Final test selection should follow your doctor’s advice.', 'No fasting required.', 'Same day', 'Blood / Urine', true, 1),
  t('cat-health', 'Diabetes Profile (Sugar)', 'diabetes-profile-sugar', 'Fasting and post-meal sugar tested together.', 'A combination of fasting and post-prandial blood sugar checks, commonly used in diabetes screening and review.', 'Fast for 8–10 hours before the fasting sample.', 'Same day', 'Plasma', false, 2),
];

export const FALLBACK_PACKAGES: Package[] = [
  {
    id: 'pkg-basic', name: 'Basic Health Checkup', slug: 'basic-health-checkup',
    description: 'A starter package covering common health parameters.',
    long_description: 'A basic package for routine health review. Prices and inclusions are confirmed by the laboratory before your booking is finalised.',
    price: null, mrp: null, image_url: null, test_count: 4, fasting_required: true,
    report_time: 'Same day',
    includes: ['Complete Blood Count (CBC)', 'Blood Sugar Fasting', 'Lipid Profile', 'Urine Routine'],
    is_popular: true, is_published: true, sort_order: 1,
  },
];

// Testimonials stay empty by default — reviews must be genuine and
// admin-provided. Never fabricate testimonials.
export const FALLBACK_TESTIMONIALS: Testimonial[] = [];
