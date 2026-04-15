import {defineField, defineType} from 'sanity';

export default defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  groups: [
    {name: 'content', title: 'Message', default: true},
    {name: 'timing', title: 'Publish Timing'},
    {name: 'link', title: 'Optional Link'},
    {name: 'settings', title: 'Display Settings'}
  ],
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', group: 'content', validation: (rule) => rule.required()}),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 4,
      group: 'content',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'level',
      title: 'Style',
      description: 'Info is neutral, Success is positive, Warning is urgent.',
      type: 'string',
      options: {list: ['Info', 'Success', 'Warning']},
      initialValue: 'Info',
      group: 'content'
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      description: 'Optional. Leave blank to show right away.',
      type: 'datetime',
      group: 'timing'
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      description: 'Optional. Leave blank to keep showing.',
      type: 'datetime',
      group: 'timing'
    }),
    defineField({name: 'linkLabel', title: 'Link Text', type: 'string', group: 'link'}),
    defineField({name: 'linkUrl', title: 'Link URL', type: 'string', group: 'link'}),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      description: 'Lower numbers show first.',
      type: 'number',
      initialValue: 100,
      group: 'settings'
    }),
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
      title: 'title',
      subtitle: 'message'
    }
  }
});
