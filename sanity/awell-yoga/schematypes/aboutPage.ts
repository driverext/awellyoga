import {defineField, defineType} from 'sanity';

export default defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  groups: [
    {name: 'header', title: 'Header', default: true},
    {name: 'story', title: 'Our Story'},
    {name: 'philosophy', title: 'Philosophy'},
    {name: 'team', title: 'Team Section'}
  ],
  fields: [
    defineField({name: 'pageTitle', title: 'Page Title', type: 'string', group: 'header'}),
    defineField({name: 'pageSubtitle', title: 'Page Subtitle', type: 'string', group: 'header'}),
    defineField({name: 'storyHeading', title: 'Story Heading', type: 'string', group: 'story'}),
    defineField({
      name: 'storyParagraphs',
      title: 'Story Paragraphs (one block per paragraph)',
      type: 'array',
      of: [{type: 'text'}],
      group: 'story'
    }),
    defineField({
      name: 'storyImage',
      title: 'Story Image',
      type: 'image',
      options: {hotspot: true},
      group: 'story'
    }),
    defineField({name: 'philosophyHeading', title: 'Philosophy Heading', type: 'string', group: 'philosophy'}),
    defineField({
      name: 'philosophyParagraphs',
      title: 'Philosophy Paragraphs (one block per paragraph)',
      type: 'array',
      of: [{type: 'text'}],
      group: 'philosophy'
    }),
    defineField({
      name: 'philosophyImage',
      title: 'Philosophy Image',
      type: 'image',
      options: {hotspot: true},
      group: 'philosophy'
    }),
    defineField({
      name: 'teamSectionHeading',
      title: 'Team Section Heading',
      description: 'Example: Meet Our Instructors',
      type: 'string',
      group: 'team'
    }),
    defineField({name: 'teamSectionSubheading', title: 'Team Section Subheading', type: 'string', group: 'team'})
  ],
  preview: {
    prepare: () => ({title: 'About Page'})
  }
});
