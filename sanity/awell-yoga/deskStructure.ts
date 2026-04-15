import type {StructureResolver} from 'sanity/structure';
import {PreviewPane} from './previewPane';

const hiddenTypes = [
  'siteSettings',
  'homepage',
  'aboutPage',
  'studioPage',
  'instructor',
  'retreatEvent',
  'announcement'
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Schedule CMS')
    .items([
      S.listItem()
        .id('site-settings-singleton')
        .title('1. Schedule Page Settings')
        .child(
          S.document()
            .schemaType('studioPage')
            .documentId('studioPage')
            .views([
              S.view.form().title('Edit'),
              S.view.component(PreviewPane).options({path: '/schedule'}).title('Live Preview')
            ])
        ),
      S.divider(),
      S.documentTypeListItem('retreatEvent')
        .id('event-list')
        .title('2. Events / Classes')
        .child(
          S.documentTypeList('retreatEvent')
            .title('Events / Classes')
            .defaultOrdering([{field: 'startDate', direction: 'asc'}])
            .child((documentId) =>
              S.document()
                .schemaType('retreatEvent')
                .documentId(documentId)
                .views([
                  S.view.form().title('Edit'),
                  S.view.component(PreviewPane).options({path: '/schedule#calendar'}).title('Live Preview')
                ])
            )
        ),
      S.documentTypeListItem('announcement')
        .id('announcement-list')
        .title('3. Announcements')
        .child(
          S.documentTypeList('announcement')
            .title('Announcements')
            .child((documentId) =>
              S.document()
                .schemaType('announcement')
                .documentId(documentId)
                .views([
                  S.view.form().title('Edit'),
                  S.view.component(PreviewPane).options({path: '/schedule'}).title('Live Preview')
                ])
            )
        ),
      S.listItem()
        .id('calendar-view')
        .title('4. Calendar View')
        .child(
          S.component(PreviewPane).options({path: '/schedule#calendar'}).title('Calendar View')
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !hiddenTypes.includes(item.getId() || '')
      )
    ]);
