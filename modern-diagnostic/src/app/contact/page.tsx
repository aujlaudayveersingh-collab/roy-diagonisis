import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, MessageCircle, User } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { buildMetadata } from '@/lib/seo';
import { getSettings, getCentres } from '@/lib/data';
import { ContactForm } from '@/components/booking-form';
import { whatsappLink } from '@/lib/constants';

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us',
  description:
    'Contact Modern Diagnostic in Dhekiajuli & Sirajuli, Assam. Call +91 9101090862, email pritamroy964@gmail.com or send a message — we are happy to help with bookings and queries.',
  path: '/contact',
});

export default async function ContactPage() {
  const [settings, centres] = await Promise.all([getSettings(), getCentres()]);
  const contact = settings.contact;

  return (
    <PageShell
      eyebrow="Contact us"
      title="We're happy to help"
      description="Have a question about a test, pricing or home collection? Reach us by phone, WhatsApp, email or the form below."
      path="/contact"
    >
      <section className="section">
        <div className="container-site grid gap-8 lg:grid-cols-5">
          {/* Contact details */}
          <div className="lg:col-span-2">
            <div className="card p-6 sm:p-7">
              <h2 className="heading-md">Reach us directly</h2>
              <ul className="mt-6 space-y-4">
                <li>
                  <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-3.5 rounded-xl border border-slate-100 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
                      <Phone className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs font-medium text-slate-400">Call us</span>
                      <span className="font-semibold text-slate-900">{contact.phone}</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappLink('Hello Modern Diagnostic, I have an enquiry.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 rounded-xl border border-slate-100 p-4 transition-colors hover:border-teal-200 hover:bg-teal-50"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#25D366] text-white">
                      <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs font-medium text-slate-400">WhatsApp</span>
                      <span className="font-semibold text-slate-900">Chat with our team</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-3.5 rounded-xl border border-slate-100 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-600 text-white">
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs font-medium text-slate-400">Email</span>
                      <span className="break-all font-semibold text-slate-900">{contact.email}</span>
                    </span>
                  </a>
                </li>
                <li className="flex items-center gap-3.5 rounded-xl border border-slate-100 p-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium text-slate-400">Opening hours</span>
                    <span className="font-semibold text-slate-900">{contact.hours}</span>
                  </span>
                </li>
                <li className="flex items-center gap-3.5 rounded-xl border border-slate-100 p-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                    <User className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium text-slate-400">Owner</span>
                    <span className="font-semibold text-slate-900">{contact.owner}</span>
                  </span>
                </li>
              </ul>
            </div>

            {/* Centres */}
            <div className="card mt-6 p-6 sm:p-7">
              <h2 className="heading-md">Our centres</h2>
              <ul className="mt-5 space-y-4">
                {centres.map((c) => (
                  <li key={c.id} className="rounded-xl border border-slate-100 p-4">
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="mt-1 flex gap-2 text-sm text-slate-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                      <span>{c.address}</span>
                    </p>
                    <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
                      <MapPin className="h-4 w-4" aria-hidden="true" /> Get directions
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="heading-md">Send us a message</h2>
              <p className="mt-2 text-sm text-slate-600">
                Fill in the form and our team will get back to you. For bookings, you can also use
                the <Link href="/book" className="font-semibold text-brand-600 hover:underline">booking form</Link>.
              </p>
            </div>
            <ContactForm />

            <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50 p-5 text-sm text-brand-900">
              <p className="flex gap-2">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="font-semibold">Prefer chatting?</strong> WhatsApp us at{' '}
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline underline-offset-2"
                  >
                    {contact.phone}
                  </a>{' '}
                  — we usually reply quickly during opening hours.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
