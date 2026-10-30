'use client';

// Appointment / test-inquiry booking form.
// Submits to a server action which validates, stores in Supabase and returns a
// booking ID. On success we show a confirmation and offer a WhatsApp hand-off
// with the booking details pre-filled.
import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, MessageCircle, AlertTriangle, CalendarCheck } from 'lucide-react';
import { CENTRES, whatsappLink } from '@/lib/constants';
import { todayISO, cn } from '@/lib/utils';
import { submitBooking, type BookingInput } from '@/actions/booking';
import { submitEnquiry } from '@/actions/enquiry';

interface Option {
  id: string;
  name: string;
  price?: number | null;
}

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function BookingForm({
  tests,
  packages,
  initialTestId,
  initialPackageId,
}: {
  tests: Option[];
  packages: Option[];
  initialTestId?: string;
  initialPackageId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [waMessage, setWaMessage] = useState<string>('');

  const minDate = todayISO();

  const [form, setForm] = useState<BookingInput>({
    patient_name: '',
    phone: '',
    email: '',
    centre_id: 'dhekiajuli',
    test_ids: initialTestId ? [initialTestId] : [],
    package_id: initialPackageId ?? '',
    preferred_date: '',
    preferred_time: '',
    collection_type: 'centre_visit',
    address: '',
    message: '',
  });

  const selectedTests = useMemo(
    () => tests.filter((t) => form.test_ids.includes(t.id)),
    [tests, form.test_ids]
  );

  const toggleTest = (id: string) =>
    setForm((f) => ({
      ...f,
      test_ids: f.test_ids.includes(id) ? f.test_ids.filter((x) => x !== id) : [...f.test_ids, id],
    }));

  const update = <K extends keyof BookingInput>(key: K, value: BookingInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.patient_name.trim()) e.patient_name = 'Please enter the patient name.';
    if (!/^[0-9+\-\s]{10,15}$/.test(form.phone.trim()))
      e.phone = 'Please enter a valid phone number (10 digits).';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = 'Please enter a valid email address.';
    if (form.collection_type === 'home_collection' && !form.address?.trim())
      e.address = 'Please provide your address for home collection.';
    if (!form.test_ids.length && !form.package_id)
      e.test_ids = 'Please select at least one test or a health package.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setState('submitting');
    setErrors({});

    startTransition(async () => {
      const result = await submitBooking(form);

      if (result.success && result.data) {
        const { bookingId, whatsappMessage } = result.data;
        setBookingRef(bookingId);
        setWaMessage(whatsappMessage);
        setState('success');
        // Reveal the confirmation smoothly.
        window.scrollTo({ top: 0, behavior: 'smooth' });
        router.refresh();
      } else {
        setErrors({ form: result.error ?? result.message ?? 'Something went wrong. Please try again.' });
        setState('error');
      }
    });
  };

  // ---------------------------------------------------------------- success
  if (state === 'success' && bookingRef) {
    return (
      <div className="card animate-fade-up overflow-hidden">
        <div className="gradient-brand px-6 py-10 text-center text-white sm:px-10">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-white/15 backdrop-blur">
            <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
          </div>
          <h3 className="font-display text-2xl font-bold sm:text-3xl">Request received!</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/90 sm:text-base">
            Thank you. Your booking request has been recorded and our team will call you shortly to
            confirm the schedule.
          </p>
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 backdrop-blur">
            <CalendarCheck className="h-5 w-5" aria-hidden="true" />
            <span className="text-left">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/70">
                Booking ID
              </span>
              <span className="font-display text-lg font-bold tracking-wide">{bookingRef}</span>
            </span>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-10">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <strong className="font-semibold">Please note:</strong> this is a booking request,
                not a confirmed appointment. Your slot is confirmed only after our team verifies and
                calls you back.
              </span>
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a
              href={waMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Send on WhatsApp
            </a>
            <button
              type="button"
              onClick={() => {
                setState('idle');
                setBookingRef(null);
                setForm((f) => ({ ...f, patient_name: '', phone: '', email: '', address: '', message: '', preferred_date: '', preferred_time: '', test_ids: [], package_id: '' }));
              }}
              className="btn-secondary"
            >
              Make another booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------ form
  return (
    <form onSubmit={onSubmit} noValidate className="card p-5 sm:p-8">
      {errors.form && (
        <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errors.form}
        </div>
      )}

      {/* Patient details */}
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-700">
          Patient details
        </legend>

        <div>
          <label htmlFor="patient_name" className="label">
            Patient Name <span className="text-red-500">*</span>
          </label>
          <input
            id="patient_name"
            name="patient_name"
            type="text"
            autoComplete="name"
            value={form.patient_name}
            onChange={(e) => update('patient_name', e.target.value)}
            placeholder="Full name of the patient"
            className={cn('field', errors.patient_name && 'field-error')}
            aria-invalid={!!errors.patient_name}
          />
          {errors.patient_name && <p className="error-text">{errors.patient_name}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="label">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="10-digit mobile number"
            className={cn('field', errors.phone && 'field-error')}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p className="error-text">{errors.phone}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="email" className="label">
            Email <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@example.com"
            className={cn('field', errors.email && 'field-error')}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
      </fieldset>

      {/* Collection preference */}
      <fieldset className="mt-8 border-t border-slate-100 pt-6">
        <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-700">
          How would you like to give the sample?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all',
              form.collection_type === 'centre_visit'
                ? 'border-brand-500 bg-brand-50'
                : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <input
              type="radio"
              name="collection_type"
              value="centre_visit"
              checked={form.collection_type === 'centre_visit'}
              onChange={() => update('collection_type', 'centre_visit')}
              className="mt-1 h-4 w-4 accent-brand-600"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-900">Visit a centre</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Come to Dhekiajuli or Sirajuli centre at your convenient time.
              </span>
            </span>
          </label>

          <label
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all',
              form.collection_type === 'home_collection'
                ? 'border-teal-500 bg-teal-50'
                : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <input
              type="radio"
              name="collection_type"
              value="home_collection"
              checked={form.collection_type === 'home_collection'}
              onChange={() => update('collection_type', 'home_collection')}
              className="mt-1 h-4 w-4 accent-teal-600"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-900">Home sample collection</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Our phlebotomist visits your home to collect the sample.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5">
          <label htmlFor="centre_id" className="label">
            Select Centre
          </label>
          <select
            id="centre_id"
            name="centre_id"
            value={form.centre_id}
            onChange={(e) => update('centre_id', e.target.value)}
            className="field"
          >
            {CENTRES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.shortName}
              </option>
            ))}
          </select>
        </div>

        {form.collection_type === 'home_collection' && (
          <div className="mt-5 animate-fade-up">
            <label htmlFor="address" className="label">
              Collection Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="House no., landmark, locality, PIN code"
              className={cn('field', errors.address && 'field-error')}
              aria-invalid={!!errors.address}
            />
            {errors.address && <p className="error-text">{errors.address}</p>}
          </div>
        )}
      </fieldset>

      {/* Tests & packages */}
      <fieldset className="mt-8 border-t border-slate-100 pt-6">
        <legend className="mb-1 text-sm font-semibold uppercase tracking-wider text-brand-700">
          Select tests or a health package <span className="text-red-500">*</span>
        </legend>
        <p className="mb-4 text-xs text-slate-500">
          Choose one or more tests, or pick a package. Can&apos;t decide? Select nothing and we&apos;ll
          help you choose on the call.
        </p>

        {/* Packages */}
        {packages.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Health packages</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {packages.map((p) => (
                <label
                  key={p.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3.5 transition-all',
                    form.package_id === p.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <input
                    type="radio"
                    name="package_id"
                    checked={form.package_id === p.id}
                    onChange={() => update('package_id', form.package_id === p.id ? '' : p.id)}
                    className="h-4 w-4 accent-teal-600"
                  />
                  <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tests */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tests</p>
        <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 p-2">
          <div className="grid gap-1 sm:grid-cols-2">
            {tests.map((t) => (
              <label
                key={t.id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  form.test_ids.includes(t.id) ? 'bg-brand-50 text-brand-800' : 'hover:bg-slate-50'
                )}
              >
                <input
                  type="checkbox"
                  checked={form.test_ids.includes(t.id)}
                  onChange={() => toggleTest(t.id)}
                  className="h-4 w-4 rounded accent-brand-600"
                />
                <span className="flex-1 font-medium text-slate-800">{t.name}</span>
              </label>
            ))}
          </div>
        </div>
        {errors.test_ids && <p className="error-text">{errors.test_ids}</p>}

        {selectedTests.length > 0 && (
          <p className="mt-3 text-xs text-slate-500">
            {selectedTests.length} test{selectedTests.length > 1 ? 's' : ''} selected.
          </p>
        )}
      </fieldset>

      {/* Schedule */}
      <fieldset className="mt-8 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
        <legend className="sr-only">Preferred schedule</legend>
        <div>
          <label htmlFor="preferred_date" className="label">
            Preferred Date
          </label>
          <input
            id="preferred_date"
            name="preferred_date"
            type="date"
            min={minDate}
            value={form.preferred_date}
            onChange={(e) => update('preferred_date', e.target.value)}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="preferred_time" className="label">
            Preferred Time
          </label>
          <select
            id="preferred_time"
            name="preferred_time"
            value={form.preferred_time}
            onChange={(e) => update('preferred_time', e.target.value)}
            className="field"
          >
            <option value="">Select a time slot</option>
            <option>07:00 AM – 09:00 AM</option>
            <option>09:00 AM – 11:00 AM</option>
            <option>11:00 AM – 01:00 PM</option>
            <option>01:00 PM – 04:00 PM</option>
            <option>04:00 PM – 06:00 PM</option>
            <option>06:00 PM – 08:00 PM</option>
          </select>
        </div>
      </fieldset>

      {/* Message */}
      <div className="mt-8 border-t border-slate-100 pt-6">
        <label htmlFor="message" className="label">
          Additional Message <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          placeholder="Any doctor's note, specific instructions or questions"
          className="field"
        />
      </div>

      {/* Submit */}
      <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          By submitting, you agree to be contacted on the phone number provided.
        </p>
        <button type="submit" disabled={isPending} className="btn-primary btn-lg w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting…
            </>
          ) : (
            'Submit Booking Request'
          )}
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Contact enquiry form (used on /contact)
// ---------------------------------------------------------------------------
export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({ name: '', phone: '', email: '', subject: '', message: '' });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!values.name.trim()) err.name = 'Please enter your name.';
    if (!/^[0-9+\-\s]{10,15}$/.test(values.phone.trim())) err.phone = 'Please enter a valid phone number.';
    if (!values.message.trim()) err.message = 'Please enter your message.';
    setErrors(err);
    if (Object.keys(err).length) return;

    setStatus('idle');
    startTransition(async () => {
      const res = await submitEnquiry(values);
      if (res.success) {
        setStatus('success');
        setValues({ name: '', phone: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    });
  };

  if (status === 'success') {
    return (
      <div className="card animate-fade-up p-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <h3 className="heading-md">Message sent!</h3>
        <p className="mt-2 text-sm text-slate-600">
          Thank you for reaching out. Our team will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card p-5 sm:p-8">
      {status === 'error' && (
        <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Something went wrong. Please try again or call us directly.
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="label">Your Name <span className="text-red-500">*</span></label>
          <input id="c-name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} className={cn('field', errors.name && 'field-error')} placeholder="Full name" />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="c-phone" className="label">Phone <span className="text-red-500">*</span></label>
          <input id="c-phone" type="tel" inputMode="tel" value={values.phone} onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))} className={cn('field', errors.phone && 'field-error')} placeholder="10-digit mobile number" />
          {errors.phone && <p className="error-text">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="c-email" className="label">Email <span className="font-normal text-slate-400">(optional)</span></label>
          <input id="c-email" type="email" value={values.email} onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} className="field" placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="c-subject" className="label">Subject <span className="font-normal text-slate-400">(optional)</span></label>
          <input id="c-subject" value={values.subject} onChange={(e) => setValues((v) => ({ ...v, subject: e.target.value }))} className="field" placeholder="What is this about?" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-message" className="label">Message <span className="text-red-500">*</span></label>
          <textarea id="c-message" rows={5} value={values.message} onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))} className={cn('field', errors.message && 'field-error')} placeholder="How can we help you?" />
          {errors.message && <p className="error-text">{errors.message}</p>}
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…</> : 'Send Message'}
        </button>
      </div>
    </form>
  );
}
