import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {presentationTool} from 'sanity/presentation';
import {schemaTypes} from './schematypes';
import {structure} from './deskStructure';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'el2cwhs4';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';
const previewOrigin = process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:4200';
const fallbackPreviewOrigin = previewOrigin.includes('localhost')
  ? previewOrigin.replace('localhost', '127.0.0.1')
  : previewOrigin;

export default defineConfig({
  name: 'default',
  title: 'A-WELL Schedule CMS',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({structure}),
    presentationTool({
      previewUrl: {
        initial: `${previewOrigin}/schedule`
      },
      allowOrigins: Array.from(new Set([previewOrigin, fallbackPreviewOrigin]))
    })
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({schemaType}) => ['retreatEvent', 'announcement'].includes(schemaType))
  },
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'retreatEvent') {
        const deleteAction = prev.find((action) => action.action === 'delete');
        if (!deleteAction) {
          return prev;
        }

        const otherActions = prev.filter((action) => action.action !== 'delete');
        return [...otherActions, deleteAction];
      }

      return prev;
    },
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          (templateItem) => ['retreatEvent', 'announcement'].includes(templateItem.templateId)
        );
      }

      return prev;
    }
  }
});
