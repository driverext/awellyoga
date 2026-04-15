import type {StructureResolver} from 'sanity/structure';

const singletonTypes = ['siteSettings', 'homepage', 'aboutPage', 'studioPage'];

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
      S.listItem()
        .title('Homepage')
        .child(
          S.document()
            .schemaType('homepage')
            .documentId('homepage')
        ),
      S.listItem()
        .title('About Page')
        .child(
          S.document()
            .schemaType('aboutPage')
            .documentId('aboutPage')
        ),
      S.listItem()
        .title('Studio Page')
        .child(
          S.document()
            .schemaType('studioPage')
            .documentId('studioPage')
        ),
      S.divider(),
      S.documentTypeListItem('instructor').title('Instructors'),
      S.documentTypeListItem('retreatEvent').title('Retreats & Events'),
      S.documentTypeListItem('announcement').title('Announcements'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !singletonTypes.includes(item.getId() || '')
      )
    ]);
