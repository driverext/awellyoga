import {defineField, defineType} from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    {name: 'contact', title: 'Contact Info', default: true},
    {name: 'social', title: 'Social Links'},
    {name: 'seo', title: 'SEO (Advanced)'}
  ],
  fields: [
    defineField({
      name: 'studioName',
      title: 'Studio Name',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'siteTagline',
      title: 'Tagline',
      description: 'Short line shown under the studio name in some places.',
      type: 'string',
      group: 'contact'
    }),
    defineField({name: 'primaryPhone', title: 'Phone Number', type: 'string', group: 'contact'}),
    defineField({
      name: 'primaryEmail',
      title: 'Email Address',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.email().warning('Please enter a valid email address')
    }),
    defineField({name: 'addressLine', title: 'Street Address', type: 'string', group: 'contact'}),
    defineField({name: 'cityStateZip', title: 'City, State ZIP', type: 'string', group: 'contact'}),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      description: 'Add each social profile you want shown on the website.',
      type: 'array',
      group: 'social',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: ['Instagram', 'Facebook', 'YouTube', 'TikTok', 'Pinterest', 'Other']
              }
            }),
            defineField({name: 'url', title: 'URL', type: 'url'})
          ],
          preview: {
            select: {title: 'platform', subtitle: 'url'}
          }
        }
      ]
    }),
    defineField({
      name: 'defaultSeoTitle',
      title: 'Default SEO Title',
      description: 'Optional. Leave blank if you are unsure.',
      type: 'string',
      group: 'seo'
    }),
    defineField({
      name: 'defaultSeoDescription',
      title: 'Default SEO Description',
      description: 'Optional. Search engines may use this text.',
      type: 'text',
      rows: 3,
      group: 'seo'
    })
  ],
  preview: {
    prepare: () => ({title: 'Site Settings'})
  }
});
