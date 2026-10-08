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
