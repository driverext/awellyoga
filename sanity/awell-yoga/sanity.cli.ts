import {defineCliConfig} from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'el2cwhs4',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production'
  }
});
