// One identity and fixed terms for the page, schedule, and both booking endpoints.
export const NEURONIDRA_EVENT = {
  id: 'special-event-neuronidra-prishtina-2026-10-15',
  title: 'NeuroNidra™ — A Therapeutic Experience',
  eventType: 'Special Event' as const,
  instructorName: 'Arieta Berisha Kirk',
  startDate: '2026-10-15T18:00:00+02:00',
  endDate: '2026-10-15T20:00:00+02:00',
  location: 'Prishtina, Kosovo',
  priceLabel: '30 €',
  unitAmountCents: 3000,
  currency: 'eur',
  maxSpots: 12,
  ctaLabel: 'Learn More',
  ctaUrl: '/neuronidra',
  summary: 'Guided deep rest with Arieta Berisha Kirk. Pay by card online, or reserve now and pay in cash on arrival.'
};
export const NEURONIDRA_IMAGE = '/assets/workshops/neuronidra.jpg';
export const NEURONIDRA_CASH_NOTE = 'Please bring 30 € in cash. Doors open 17:45.';
export const NEURONIDRA_DATE_LABEL = 'Thursday, 15 October 2026 · 18:00–20:00 (Europe/Belgrade)';

export const NEURONIDRA_OCTOBER_17_EVENT = {
  ...NEURONIDRA_EVENT,
  id: 'special-event-neuronidra-prishtina-2026-10-17',
  startDate: '2026-10-17T18:00:00+02:00',
  endDate: '2026-10-17T20:00:00+02:00',
  ctaUrl: '/neuronidra-october-17'
};
export const NEURONIDRA_EVENTS = [NEURONIDRA_EVENT, NEURONIDRA_OCTOBER_17_EVENT];
export function getNeuroNidraDateLabel(event: typeof NEURONIDRA_EVENT): string {
  const date = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Belgrade' }).format(new Date(event.startDate));
  return `${date} · 18:00–20:00 (Europe/Belgrade)`;
}
