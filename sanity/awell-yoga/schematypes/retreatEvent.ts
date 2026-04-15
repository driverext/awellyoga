import {defineField, defineType} from 'sanity';

export default defineType({
  name: 'retreatEvent',
  title: 'Event',
  type: 'document',
  groups: [
    {name: 'basics', title: 'Basic Info', default: true},
    {name: 'schedule', title: 'Date, Time, Place'},
    {name: 'booking', title: 'Booking & Payment'},
    {name: 'capacity', title: 'Class Capacity'},
    {name: 'media', title: 'Image'},
    {name: 'advanced', title: 'Advanced'}
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Event Name',
      type: 'string',
      group: 'basics',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {list: ['Yoga Class', 'Workshop', 'Retreat', 'Special Event']},
      initialValue: 'Yoga Class',
      group: 'basics'
    }),
    defineField({
      name: 'summary',
      title: 'Short Description',
      description: 'One short paragraph shown on the schedule cards.',
      type: 'text',
      rows: 3,
      group: 'basics'
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      description: 'Optional long description.',
      type: 'text',
      rows: 8,
      group: 'basics'
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date & Time',
      type: 'datetime',
      group: 'schedule',
      validation: (rule) => rule.required()
    }),
    defineField({name: 'endDate', title: 'End Date & Time', type: 'datetime', group: 'schedule'}),
    defineField({name: 'location', title: 'Location', type: 'string', group: 'schedule'}),
    defineField({
      name: 'instructor',
      title: 'Instructor',
      description: 'Who teaches this class/event.',
      type: 'reference',
      to: [{type: 'instructor'}],
      group: 'basics'
    }),
    defineField({
      name: 'priceLabel',
      title: 'Price Text',
      description: 'Example: $22 Drop-In or $40 Workshop',
      type: 'string',
      group: 'booking'
    }),
    defineField({
      name: 'bookingUrl',
      title: 'Stripe Checkout URL',
      type: 'url',
      description:
        'Paste the Stripe Payment Link / Checkout URL for this event. This powers the Book button on the Schedule page.',
      group: 'booking'
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID (Recommended)',
      type: 'string',
      description:
        'Use a Stripe Price ID (example: price_123) for account-linked bookings with automatic booking records.',
      group: 'booking'
    }),
    defineField({
      name: 'platformFeePercent',
      title: 'Studio Platform Fee %',
      description:
        'Percent kept by A-WELL Yoga for bills/operations when using connected payouts. Default is 30.',
      type: 'number',
      initialValue: 30,
      group: 'booking',
      validation: (rule) => rule.min(0).max(100)
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Optional Extra Link Text',
      description: 'Example: Learn More',
      type: 'string',
      group: 'booking'
    }),
    defineField({name: 'ctaUrl', title: 'Optional Extra Link URL', type: 'string', group: 'booking'}),
    defineField({
      name: 'maxSpots',
      title: 'Maximum Spots',
      description: 'For yoga classes, leave blank to use default cap of 7.',
      type: 'number',
      group: 'capacity',
      validation: (rule) => rule.min(1).max(100)
    }),
    defineField({
      name: 'spotsBooked',
      title: 'Spots Booked',
      description: 'Update this as signups come in. When it reaches max spots, booking locks.',
      type: 'number',
      initialValue: 0,
      group: 'capacity',
      validation: (rule) => rule.min(0).max(100)
    }),
    defineField({name: 'heroImage', title: 'Event Image', type: 'image', options: {hotspot: true}, group: 'media'}),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      description: 'Lower numbers show first.',
      type: 'number',
      initialValue: 100,
      group: 'advanced'
    }),
    defineField({name: 'isFeatured', title: 'Featured', type: 'boolean', initialValue: false, group: 'advanced'}),
    defineField({
      name: 'isActive',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
      group: 'advanced'
    })
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'displayOrderAsc',
      by: [{field: 'displayOrder', direction: 'asc'}]
    },
    {
      title: 'Start Date',
      name: 'startDateAsc',
      by: [{field: 'startDate', direction: 'asc'}]
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'startDate',
      media: 'heroImage'
    },
    prepare: ({title, subtitle, media}) => ({
      title,
      subtitle: subtitle ? new Date(subtitle).toLocaleString() : 'No date set',
      media
    })
  }
});
