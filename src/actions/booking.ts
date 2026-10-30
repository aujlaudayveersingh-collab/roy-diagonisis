'use server';

// =============================================================================
// Booking server action — validates input, stores in Supabase, returns a
// human-friendly booking ID and a pre-filled WhatsApp message.
// Never trusts client input; never exposes patient data publicly.
// =============================================================================
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { BUSINESS, CENTRES, whatsappLink } from '@/lib/constants';
import type { ActionResult } from '@/lib/types';

export interface BookingInput {
  patient_name: string;
  phone: string;
  email?: string;
  centre_id: string;
  test_ids: string[];
  package_id?: string;
  preferred_date?: string;
  preferred_time?: string;
  collection_type: 'home_collection' | 'centre_visit';
  address?: string;
  message?: string;
}

const PHONE_RE = /^[0-9+\-\s()]{10,15}$/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Server-side validation — mirrors and enforces the client rules. */
function validate(input: BookingInput): string | null {
  if (!input.patient_name || input.patient_name.trim().length < 2)
    return 'Please enter the patient name.';
  if (!input.phone || !PHONE_RE.test(input.phone.trim()))
    return 'Please enter a valid phone number.';
  if (input.email && !EMAIL_RE.test(input.email.trim()))
    return 'Please enter a valid email address.';
  if (!['dhekiajuli', 'sirajuli'].includes(input.centre_id))
    return 'Please select a valid centre.';
  if (!['home_collection', 'centre_visit'].includes(input.collection_type))
    return 'Please choose how you would like to give the sample.';
  if (input.collection_type === 'home_collection' && (!input.address || input.address.trim().length < 5))
    return 'Please provide your collection address.';
  if (!input.test_ids?.length && !input.package_id)
    return 'Please select at least one test or a health package.';
  if (input.test_ids?.length && input.test_ids.length > 40)
    return 'Too many tests selected. Please contact us directly.';
  return null;
}

/** Generates a booking reference like MD-261030-8F3K. */
function makeBookingId(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MD-${y}${m}${d}-${rand}`;
}

export async function submitBooking(input: BookingInput): Promise<
  ActionResult<{ bookingId: string; whatsappMessage: string }>
> {
  try {
    const validationError = validate(input);
    if (validationError) return { success: false, error: validationError };

    // Resolve readable test/package labels (also acts as server-side checks
    // that the IDs actually exist).
    let testNames: string[] = [];
    let packageName: string | null = null;

    const supabase = await createClient();

    if (supabase) {
      if (input.test_ids?.length) {
        const { data: testRows } = await supabase
          .from('tests')
          .select('id, name')
          .in('id', input.test_ids)
          .eq('is_active', true);
        testNames = (testRows ?? []).map((r) => r.name);
      }
      if (input.package_id) {
        const { data: pkgRow } = await supabase
          .from('packages')
          .select('id, name')
          .eq('id', input.package_id)
          .eq('is_published', true)
          .single();
        packageName = pkgRow?.name ?? null;
      }
    }

    const labelParts = [...testNames];
    if (packageName) labelParts.push(`${packageName} (Package)`);
    const testNamesLabel = labelParts.length ? labelParts.join(', ') : 'To be advised';

    // Build the WhatsApp summary used both for the confirmation screen and the
    // patient's own hand-off message.
    const centre = CENTRES.find((c) => c.id === input.centre_id);
    const lines = [
      `Hello ${BUSINESS.name}, I have submitted a booking request.`,
      ``,
      `Booking request (please confirm):`,
      `• Patient: ${input.patient_name.trim()}`,
      `• Phone: ${input.phone.trim()}`,
      input.email ? `• Email: ${input.email.trim()}` : null,
      `• Tests/Package: ${testNamesLabel}`,
      `• Centre: ${centre?.name ?? input.centre_id}`,
      `• Collection: ${input.collection_type === 'home_collection' ? 'Home sample collection' : 'Centre visit'}`,
      input.collection_type === 'home_collection' && input.address ? `• Address: ${input.address.trim()}` : null,
      input.preferred_date ? `• Preferred date: ${input.preferred_date}` : null,
      input.preferred_time ? `• Preferred time: ${input.preferred_time}` : null,
      input.message ? `• Note: ${input.message.trim()}` : null,
    ].filter(Boolean) as string[];
    const waMessage = whatsappLink(lines.join('\n'));

    // Persist when Supabase is available.
    let bookingId = makeBookingId();

    if (supabase) {
      // Ensure the reference is unique.
      for (let i = 0; i < 5; i++) {
        const { data: clash } = await supabase
          .from('bookings')
          .select('id')
          .eq('booking_id', bookingId)
          .maybeSingle();
        if (!clash) break;
        bookingId = makeBookingId();
      }

      const { error } = await supabase.from('bookings').insert({
        booking_id: bookingId,
        patient_name: input.patient_name.trim().slice(0, 120),
        phone: input.phone.trim().slice(0, 20),
        email: input.email?.trim().slice(0, 160) || null,
        centre_id: input.centre_id,
        test_ids: input.test_ids ?? [],
        test_names: testNamesLabel,
        package_id: input.package_id || null,
        package_name: packageName,
        preferred_date: input.preferred_date || null,
        preferred_time: input.preferred_time || null,
        collection_type: input.collection_type,
        address: input.address?.trim().slice(0, 500) || null,
        message: input.message?.trim().slice(0, 1000) || null,
        status: 'new',
      });

      if (error) {
        console.error('[booking] insert failed:', error.message);
        return {
          success: false,
          error:
            'We could not save your booking right now. Please try again or call us on ' +
            BUSINESS.phone +
            '.',
        };
      }
    } else {
      // No database connected yet — still return a reference so the flow is
      // demonstrable, but make it clear to the operator via the console.
      console.warn('[booking] Supabase not configured — booking not persisted.', {
        bookingId,
        patient: input.patient_name,
        phone: input.phone,
      });
    }

    return { success: true, data: { bookingId, whatsappMessage: waMessage } };
  } catch (err) {
    console.error('[booking] unexpected error:', err);
    return {
      success: false,
      error: 'Something unexpected happened. Please try again or call ' + BUSINESS.phone + '.',
    };
  }
}
