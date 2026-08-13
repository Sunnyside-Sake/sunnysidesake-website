// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Custom domain, so NO `base` value — internal links stay root-relative.
  // Paired with public/CNAME. See PLAN.md §9 (DNS cutover).
  site: 'https://sunnysidesake.com',

  vite: {
    plugins: [tailwindcss()],
  },
});
