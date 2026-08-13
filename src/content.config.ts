import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Schemas are deliberately generous with `.optional()`.
 *
 * Adding a field later means touching the schema AND every template that reads it,
 * so fields we might only sometimes fill are declared now. Two concrete reasons this
 * matters right now:
 *   - photography is placeholder-only, so every image is optional
 *   - the active batch has no final numbers yet (abv/smv/acidity land at release)
 */

const batches = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/batches' }),
  // Callback form is required to get the `image()` helper — it is NOT `z.image()`.
  schema: ({ image }) => z.object({
    // `id` is the QR identity. Zero-padded, sequential, NEVER reused or renumbered.
    // These go on printed labels — see PLAN.md §5.
    id: z.string().regex(/^\d{3}$/, 'Batch id must be zero-padded 3 digits, e.g. "001"'),

    name: z.string(),
    nameJa: z.string().optional(),

    // The lead. A claim, not a vibe — what this batch was trying to do.
    thesis: z.string(),

    status: z.enum(['released', 'active']),
    draft: z.boolean().default(false),

    brewStarted: z.coerce.date(),
    released: z.coerce.date().optional(),

    // Vitals
    rice: z.string().optional(),
    polishRatio: z.number().optional(),
    koji: z.string().optional(),
    yeast: z.string().optional(),
    abv: z.number().optional(),
    smv: z.number().optional(),
    acidity: z.number().optional(),

    // Sensory
    tastingNotes: z.array(z.string()).default([]),
    servingTemp: z.string().optional(),
    pairing: z.array(z.string()).default([]),

    batchNotes: z.string().optional(),

    // Collab. Slug into the `artists` collection.
    artist: z.string().optional(),

    // Co-located images, optimized at build. Relative paths: "./bottle.jpg"
    bottle: image().optional(),
    label: image().optional(),
  }),
});

const artists = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/artists' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    nameJa: z.string().optional(),
    draft: z.boolean().default(false),
    bio: z.string().optional(),
    website: z.string().url().optional(),
    instagram: z.string().optional(),
    photo: image().optional(),
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/journal' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    titleJa: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    excerpt: z.string().optional(),
    cover: image().optional(),
  }),
});

export const collections = { batches, artists, journal };
