// Shared TypeScript types for the Modern Diagnostic site.

export type BookingStatus = 'new' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type CollectionType = 'home_collection' | 'centre_visit';
export type EnquiryStatus = 'new' | 'in_progress' | 'resolved';
export type AdminRole = 'admin' | 'staff';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  colour: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Test {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number | null;
  mrp: number | null;
  preparation: string | null;
  report_time: string | null;
  sample_type: string | null;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  category?: Category | null;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  price: number | null;
  mrp: number | null;
  image_url: string | null;
  test_count: number | null;
  fasting_required: boolean | null;
  report_time: string | null;
  includes: string[];
  is_popular: boolean;
  is_published: boolean;
  sort_order: number;
}

export interface Booking {
  id: string;
  booking_id: string;
  patient_name: string;
  phone: string;
  email: string | null;
  centre_id: string;
  test_ids: string[];
  test_names: string | null;
  package_id: string | null;
  package_name: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  collection_type: CollectionType;
  address: string | null;
  message: string | null;
  status: BookingStatus;
  internal_notes: string | null;
  created_at: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string;
  status: EnquiryStatus;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  message: string;
  is_visible: boolean;
  sort_order: number;
}

export interface SiteSettings {
  brand: { name: string; tagline: string; logo_url: string | null; favicon_url: string | null };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primary_cta: { label: string; href: string };
    secondary_cta: { label: string; href: string };
    image_url: string | null;
    highlights: string[];
  };
  about: {
    headline: string;
    mission: string;
    body: string;
    commitments: string[];
    image_url: string | null;
  };
  contact: { phone: string; whatsapp: string; email: string; website: string; hours: string; owner: string };
  home_collection: {
    headline: string;
    body: string;
    steps: { title: string; body: string }[];
    phone: string;
    whatsapp: string;
  };
  announcement: { enabled: boolean; text: string; link_href: string; link_label: string };
  seo: { meta_description: string; keywords: string[] };
  social: { facebook: string | null; instagram: string | null; youtube: string | null };
}

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
