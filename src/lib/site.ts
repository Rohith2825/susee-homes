/** Site-wide constants — phone numbers, links, geodata. */

export const SITE = {
  name: 'Susee Homes',
  /** Primary sales line (CTA section, footer, calls). */
  phone: '+919626855553',
  phoneDisplay: '+91 96268 55553',
  /** Estimator / build-enquiry WhatsApp line. */
  buildPhone: '+919894071222',
  coordinates: { lat: 13.048, lng: 80.0966 },
  established: 2016,
} as const;

export function waLink(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

export const ANCHORS = {
  project: 'project',
  estimator: 'estimator',
  process: 'process',
  founder: 'founder',
  contact: 'contact',
  faq: 'faq',
  upcoming: 'upcoming',
  testimonials: 'testimonials',
} as const;
