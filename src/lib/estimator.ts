/** NLP brief parser + build-cost estimator (ported from the client's original logic). */

export type HomeStyle = 'Modern' | 'Traditional' | 'Luxury Villa' | 'Duplex';

export interface ParsedBrief {
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  style?: HomeStyle;
  floors?: number;
}

export interface Estimate {
  /** Lakhs (₹) — lower bound. */
  low: number;
  /** Lakhs (₹) — upper bound. */
  high: number;
  area: number;
}

export function parseBrief(text: string): ParsedBrief {
  const t = text.toLowerCase();
  const result: ParsedBrief = {};

  // Bedrooms
  const bm = t.match(/(\d+)\s*(?:bed(?:room)?s?|bhk|படுக்கை)/i);
  if (bm) result.bedrooms = parseInt(bm[1], 10);

  // Bathrooms
  const bathrm = t.match(/(\d+)\s*(?:bath(?:room)?s?|toilet)/i);
  if (bathrm) result.bathrooms = parseInt(bathrm[1], 10);

  // Area in sqft
  const sqm = t.match(/(\d[\d,]*)\s*(?:sq(?:uare)?\.?\s*f(?:ee|oo)?t|sqft|sft)/i);
  if (sqm) result.sqft = parseInt(sqm[1].replace(/,/g, ''), 10);

  // Style
  if (/modern|contemporary|minimalist|நவீன/i.test(t)) result.style = 'Modern';
  else if (/tradit|classic|heritage|old/i.test(t)) result.style = 'Traditional';
  else if (/villa|luxury|premium/i.test(t)) result.style = 'Luxury Villa';
  else if (/duplex|double.*storey|two.*floor/i.test(t)) result.style = 'Duplex';

  // Floors
  const fm = t.match(/(\d+)\s*(?:floor|storey|story|level)/i);
  if (fm) result.floors = parseInt(fm[1], 10);

  // Ground floor / single floor
  if (/ground\s+floor(?:\s+only)?|single\s+floor|one\s+floor/i.test(t) && !fm) result.floors = 1;

  return result;
}

export function estimateCost({ sqft, bedrooms, style }: ParsedBrief): Estimate | null {
  if (!sqft && !bedrooms) return null;
  const area = sqft || (bedrooms ? bedrooms * 450 : 0);
  let ratePerSqft = 2200; // base rate ₹/sqft
  if (style === 'Luxury Villa') ratePerSqft = 3200;
  else if (style === 'Traditional') ratePerSqft = 2000;
  else if (style === 'Modern') ratePerSqft = 2500;
  const low = Math.round((area * ratePerSqft * 0.9) / 100000);
  const high = Math.round((area * ratePerSqft * 1.1) / 100000);
  return { low, high, area };
}

export function hasDetails(p: ParsedBrief): boolean {
  return Object.keys(p).length > 0;
}
