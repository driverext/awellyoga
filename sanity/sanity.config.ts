import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {visionTool} from '@sanity/vision';
import {schemaTypes} from './schemaTypes';
import {structure} from './deskStructure';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'A-WELL Yoga CMS',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({structure}),
    visionTool()
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({schemaType}) =>
        !['siteSettings', 'homepage', 'aboutPage', 'studioPage'].includes(schemaType)
      )
  },
  document: {
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          (templateItem) =>
            !['siteSettings', 'homepage', 'aboutPage', 'studioPage'].includes(
              templateItem.templateId
            )
        );
      }

      return prev;
    }
  }
});
