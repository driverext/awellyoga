import {defineField, defineType} from 'sanity';

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero Section', default: true},
    {name: 'buttons', title: 'Buttons'},
    {name: 'intro', title: 'Intro Section'}
  ],
  fields: [
    defineField({name: 'heroTitle', title: 'Main Heading', type: 'string', group: 'hero'}),
    defineField({name: 'heroSubtitle', title: 'Subheading', type: 'text', rows: 3, group: 'hero'}),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      description: 'Main image at the top of the homepage.',
      type: 'image',
      options: {hotspot: true},
      group: 'hero'
    }),
    defineField({name: 'primaryButtonLabel', title: 'Primary Button Text', type: 'string', group: 'buttons'}),
    defineField({name: 'primaryButtonUrl', title: 'Primary Button Link', type: 'string', group: 'buttons'}),
    defineField({
      name: 'secondaryButtonLabel',
      title: 'Secondary Button Text',
      type: 'string',
      group: 'buttons'
    }),
    defineField({name: 'secondaryButtonUrl', title: 'Secondary Button Link', type: 'string', group: 'buttons'}),
    defineField({name: 'introHeading', title: 'Intro Heading', type: 'string', group: 'intro'}),
    defineField({name: 'introText', title: 'Intro Text', type: 'text', rows: 5, group: 'intro'})
  ],
  preview: {
    prepare: () => ({title: 'Homepage'})
  }
});
