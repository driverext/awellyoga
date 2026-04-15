import {defineField, defineType} from 'sanity';

export default defineType({
  name: 'instructor',
  title: 'Instructor',
  type: 'document',
  groups: [
    {name: 'profile', title: 'Profile', default: true},
    {name: 'bio', title: 'Bio & Specialties'},
    {name: 'payouts', title: 'Payout Settings'},
    {name: 'settings', title: 'Display Settings'}
  ],
  fields: [
    defineField({name: 'name', title: 'Full Name', type: 'string', group: 'profile', validation: (rule) => rule.required()}),
    defineField({
      name: 'title',
      title: 'Role / Title',
      description: 'Example: Founder and Lead Instructor',
      type: 'string',
      group: 'profile',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'photo',
      title: 'Profile Photo',
      description: 'Best results: portrait image with clear face framing.',
      type: 'image',
      options: {hotspot: true},
      group: 'profile'
    }),
    defineField({name: 'photoAlt', title: 'Photo Alt Text', type: 'string', group: 'profile'}),
    defineField({
      name: 'bio',
      title: 'Bio',
      description: 'Use blank lines between paragraphs.',
      type: 'text',
      rows: 8,
      group: 'bio'
    }),
    defineField({
      name: 'specialties',
      title: 'Specialties',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      group: 'bio'
    }),
    defineField({
      name: 'acceptsPayouts',
      title: 'Receives Stripe Payouts',
      description: 'Turn this on only after this instructor has finished Stripe onboarding.',
      type: 'boolean',
      initialValue: false,
      group: 'payouts'
    }),
    defineField({
      name: 'stripeConnectedAccountId',
      title: 'Stripe Connected Account ID',
      description: 'Example: acct_1234... This tells bookings where instructor payout should go.',
      type: 'string',
      group: 'payouts',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) {
            return true;
          }
          if (typeof value === 'string' && value.startsWith('acct_')) {
            return true;
          }
          return 'Must start with acct_';
        })
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      description: 'Lower numbers appear first.',
      type: 'number',
      initialValue: 100,
      group: 'settings'
    }),
    defineField({name: 'isFounder', title: 'Founder', type: 'boolean', initialValue: false, group: 'settings'}),
    defineField({name: 'isActive', title: 'Show on Website', type: 'boolean', initialValue: true, group: 'settings'})
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'displayOrderAsc',
      by: [{field: 'displayOrder', direction: 'asc'}]
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'title',
      media: 'photo'
    }
  }
});
