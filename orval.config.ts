import { defineConfig } from 'orval';

export default defineConfig({
  cartaisy: {
    input: {
      target: 'https://cartaisy-backend-production.up.railway.app/api-docs.json',
    },
    output: {
      mode: 'tags-split',
      target: './api/generated',
      client: 'react-query',
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: './api/apiClient.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
