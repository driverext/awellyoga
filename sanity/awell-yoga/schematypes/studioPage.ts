import {defineField, defineType} from 'sanity';

export default defineType({
  name: 'studioPage',
  title: 'Studio Page',
  type: 'document',
  groups: [
    {name: 'header', title: 'Header', default: true},
    {name: 'scheduleIntro', title: 'Schedule Intro'},
    {name: 'pricing', title: 'Pricing Checkout Links'},
    {name: 'hours', title: 'Studio Hours'}
  ],
  fields: [
    defineField({name: 'pageTitle', title: 'Page Title', type: 'string', group: 'header'}),
    defineField({name: 'pageSubtitle', title: 'Page Subtitle', type: 'string', group: 'header'}),
    defineField({name: 'scheduleHeading', title: 'Schedule Heading', type: 'string', group: 'scheduleIntro'}),
    defineField({
      name: 'scheduleBody',
      title: 'Schedule Intro Text',
      type: 'text',
      rows: 4,
      group: 'scheduleIntro'
    }),
    defineField({
      name: 'scheduleButtonLabel',
      title: 'Schedule Button Text',
      type: 'string',
      group: 'scheduleIntro'
    }),
    defineField({name: 'scheduleButtonUrl', title: 'Schedule Button Link', type: 'string', group: 'scheduleIntro'}),
    defineField({name: 'scheduleNote', title: 'Small Note', type: 'string', group: 'scheduleIntro'}),
    defineField({
      name: 'scheduleImage',
      title: 'Schedule Image',
      type: 'image',
      options: {hotspot: true},
      group: 'scheduleIntro'
    }),
    defineField({
      name: 'scheduleImageAlt',
      title: 'Schedule Image Alt Text',
      type: 'string',
      group: 'scheduleIntro'
    }),
    defineField({
      name: 'singleVisitCheckoutUrl',
      title: 'Single Visit Checkout URL',
      description: 'Stripe Payment Link for one-time class purchases.',
      type: 'url',
      group: 'pricing'
    }),
    defineField({
      name: 'classPackCheckoutUrl',
      title: 'Class Pack Checkout URL',
      description: 'Stripe Payment Link for class packages (5-pack, 10-pack, etc).',
      type: 'url',
      group: 'pricing'
    }),
    defineField({
      name: 'membershipCheckoutUrl',
      title: 'Membership Checkout URL',
      description: 'Stripe subscription checkout link for memberships and special rates.',
      type: 'url',
      group: 'pricing'
    }),
    defineField({
      name: 'studioHours',
      title: 'Studio Hours',
      description: 'Example: Monday-Friday | 6:00am - 9:00pm',
      type: 'array',
      group: 'hours',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Day(s)', type: 'string'}),
            defineField({name: 'hours', title: 'Hours', type: 'string'})
          ],
          preview: {select: {title: 'label', subtitle: 'hours'}}
        }
      ]
    })
  ],
  preview: {
    prepare: () => ({title: 'Studio Page'})
  }
});
