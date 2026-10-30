'use server';

// Contact-form enquiry action.
import { createClient } from '@/lib/supabase/server';
import { BUSINESS } from '@/lib/constants';
import type { ActionResult } from '@/lib/types';

export interface EnquiryInput {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
}

const PHONE_RE = /^[0-9+\-\s()]{10,15}$/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function submitEnquiry(input: EnquiryInput): Promise<ActionResult> {
  try {
    if (!input.name || input.name.trim().length < 2)
      return { success: false, error: 'Please enter your name.' };
    if (!input.phone || !PHONE_RE.test(input.phone.trim()))
      return { success: false, error: 'Please enter a valid phone number.' };
    if (input.email && !EMAIL_RE.test(input.email.trim()))
      return { success: false, error: 'Please enter a valid email address.' };
    if (!input.message || input.message.trim().length < 3)
      return { success: false, error: 'Please enter your message.' };

    const supabase = await createClient();
    if (!supabase) {
      console.warn('[enquiry] Supabase not configured — enquiry not persisted.', {
        name: input.name,
        phone: input.phone,
      });
      return { success: true, message: 'Received (not persisted — Supabase not configured).' };
    }

    const { error } = await supabase.from('enquiries').insert({
      name: input.name.trim().slice(0, 120),
      phone: input.phone.trim().slice(0, 20),
      email: input.email?.trim().slice(0, 160) || null,
      subject: input.subject?.trim().slice(0, 200) || null,
      message: input.message.trim().slice(0, 2000),
      status: 'new',
    });

    if (error) {
      console.error('[enquiry] insert failed:', error.message);
      return {
        success: false,
        error: 'We could not send your message. Please call us on ' + BUSINESS.phone + '.',
      };
    }

    return { success: true };
  } catch (err) {
    console.error('[enquiry] unexpected error:', err);
    return { success: false, error: 'Something unexpected happened. Please try again.' };
  }
}
