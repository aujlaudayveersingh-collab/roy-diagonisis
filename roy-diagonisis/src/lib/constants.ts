// =============================================================================
// Business constants — single source of truth for client details.
// Values here match the client brief. Anything the client still needs to
// confirm is marked [CONFIRM] and is also editable from the admin dashboard.
// =============================================================================

export const BUSINESS = {
  name: 'Modern Diagnostic',
  owner: 'Pritam Roy',
  category: 'Diagnostic Laboratory',
  domain: 'www.moderndiagnostic.com',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.moderndiagnostic.com',
  phone: '+91 9101090862',
  phoneRaw: '9191090862',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919101090862',
  email: 'pritamroy964@gmail.com',
  // [CONFIRM] Opening hours were not supplied in the brief — placeholder set,
  // editable from Admin → Content → Contact Information.
  hours: 'Mon–Sat: 7:00 AM – 8:00 PM | Sun: 7:00 AM – 12:00 PM',
} as const;

// ---------------------------------------------------------------------------
// Admin login
// ---------------------------------------------------------------------------
// The admin signs in with a username (not an email). Supabase Auth stores users
// by email, so the username is mapped to a canonical email behind the scenes:
//   ROYLAB123  ->  roylab123@moderndiagnostic.com
// The password is NEVER stored in code — it is set once in Supabase (hashed).
export const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'ROYLAB123';
export const ADMIN_EMAIL_DOMAIN = 'moderndiagnostic.com';

export type CentreId = 'dhekiajuli' | 'sirajuli';

export interface Centre {
  id: CentreId;
  name: string;
  shortName: string;
  address: string;
  addressLines: string[];
  phone: string;
  whatsapp: string;
  mapsUrl: string;
  hours: string;
  tagline: string;
  services: string[];
}

export const CENTRES: Centre[] = [
  {
    id: 'dhekiajuli',
    name: 'Dhekiajuli Centre',
    shortName: 'Dhekiajuli',
    address:
      'Ward No. 4, Anil Borah Path, Opp. Style Baazar, Dhekiajuli, District Sonitpur, Assam — 784110',
    addressLines: [
      'Ward No. 4, Anil Borah Path',
      'Opposite Style Baazar',
      'Dhekiajuli, District Sonitpur',
      'Assam — 784110',
    ],
    phone: BUSINESS.phone,
    whatsapp: BUSINESS.whatsapp,
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Ward+No.+4+Anil+Borah+Path+Opp+Style+Baazar+Dhekiajuli+Assam+784110',
    hours: BUSINESS.hours,
    tagline: 'Our main centre in the heart of Dhekiajuli town.',
    services: ['Blood Tests', 'Health Packages', 'Home Sample Collection', 'Report Delivery'],
  },
  {
    id: 'sirajuli',
    name: 'Sirajuli Centre',
    shortName: 'Sirajuli',
    address: 'NH 15, Sirajuli, Near Colony Road, Assam',
    addressLines: ['NH 15, Sirajuli', 'Near Colony Road', 'Assam'],
    phone: BUSINESS.phone,
    whatsapp: BUSINESS.whatsapp,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=NH+15+Sirajuli+Near+Colony+Road+Assam',
    hours: BUSINESS.hours,
    tagline: 'Serving families along the NH 15 corridor.',
    services: ['Blood Tests', 'Health Packages', 'Home Sample Collection', 'Report Delivery'],
  },
];

export const getCentre = (id: string): Centre | undefined => CENTRES.find((c) => c.id === id);

/** Build a wa.me link with a pre-filled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${BUSINESS.whatsapp}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_DEFAULT_MESSAGE =
  'Hello Modern Diagnostic, I would like to enquire about a test or home sample collection.';

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Our Services', href: '/services' },
  { label: 'Tests & Packages', href: '/tests' },
  { label: 'Our Centres', href: '/centres' },
  { label: 'Home Collection', href: '/home-collection' },
  { label: 'Contact', href: '/contact' },
] as const;

export const BOOKING_STATUSES = [
  { value: 'new', label: 'New', tone: 'info' },
  { value: 'pending', label: 'Pending', tone: 'warning' },
  { value: 'confirmed', label: 'Confirmed', tone: 'success' },
  { value: 'completed', label: 'Completed', tone: 'neutral' },
  { value: 'cancelled', label: 'Cancelled', tone: 'danger' },
] as const;

export const ENQUIRY_STATUSES = [
  { value: 'new', label: 'New', tone: 'info' },
  { value: 'in_progress', label: 'In Progress', tone: 'warning' },
  { value: 'resolved', label: 'Resolved', tone: 'success' },
] as const;
