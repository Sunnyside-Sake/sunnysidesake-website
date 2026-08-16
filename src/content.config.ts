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

    // The phrase printed on the back label — "Not our first Rodeo". These
    // already exist on every bottle, so the site should use them rather than
    // invent a parallel hook.
    tagline: z.string(),

    // Optional deeper claim: what the batch was actually trying to do and
    // whether it worked. Written per batch; the tagline carries the page
    // until this exists.
    thesis: z.string().optional(),

    /**
     * Per-batch accent, sampled from the label artwork.
     *
     * The mark is recoloured for every batch — Rodeo red, Catdog teal,
     * Thousand and one stars blue, Sassy Snow Angel mint. That is an existing
     * brand system, so the site follows it instead of forcing one global
     * accent. These override --color-flare* on the batch page.
     */
    accent: z.string().regex(/^#[0-9a-f]{6}$/i),
    accentWarm: z.string().regex(/^#[0-9a-f]{6}$/i),

    status: z.enum(['released', 'active']),
    draft: z.boolean().default(false),

    // Both optional: the printed labels do not carry dates, so real batches
    // exist without them until the brew records are dug out.
    brewStarted: z.coerce.date().optional(),
    released: z.coerce.date().optional(),

    // Vitals
    rice: z.string().optional(),
    polishRatio: z.number().optional(),
    koji: z.string().optional(),
    yeast: z.string().optional(),
    water: z.string().optional(),

    /**
     * Sake grade, derived from seimaibuai (the % of the grain REMAINING).
     *   <= 50%  junmai daiginjo
     *   <= 60%  junmai ginjo
     *   > 60%   junmai
     * Stated explicitly rather than computed: the classification is Dan's
     * call, and a wrong grade on a trade-facing site is the kind of error
     * this audience notices immediately.
     */
    grade: z.string().optional(),

    /**
     * Style descriptors that sit alongside the grade rather than replacing it —
     * a sake can be Junmai Daiginjo AND nigori. Kept as an array because these
     * stack (nigori, namazake, sparkling…).
     */
    style: z.array(z.string()).default([]),

    // Collaborators / venues credited on the label.
    thanks: z.string().optional(),
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
    bottleAlt: image().optional(),
    labelFront: image().optional(),
    labelBack: image().optional(),
  }),
});

/**
 * Makgeolli — a separate collection, not a flag on `batches`.
 *
 * Korean rice wine is a different product with different vocabulary: nuruk
 * rather than koji, no seimaibuai and therefore no grade, and no SMV. Forcing
 * it through a sake-shaped schema would mean a pile of inapplicable fields and
 * a vitals grid full of blanks.
 *
 * Wildflower is the awkward case that proves the point: it is labelled
 * "Sakegolli" and uses BOTH nuruk and koji with Yamada Nishiki, so `koji` and
 * `polishRatio` exist here as optional — a hybrid needs both vocabularies.
 */
const makgeolli = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/makgeolli' }),
  schema: ({ image }) => z.object({
    // Own numbering space. QR target is /m/001, parallel to sake's /b/001 —
    // short enough to keep the code sparse, and it can never collide.
    id: z.string().regex(/^\d{3}$/, 'Makgeolli id must be zero-padded 3 digits'),

    name: z.string(),
    nameKo: z.string().optional(),
    tagline: z.string(),
    thesis: z.string().optional(),

    status: z.enum(['released', 'active']),
    draft: z.boolean().default(false),

    accent: z.string().regex(/^#[0-9a-f]{6}$/i),
    accentWarm: z.string().regex(/^#[0-9a-f]{6}$/i),

    brewStarted: z.coerce.date().optional(),
    released: z.coerce.date().optional(),

    // Ingredients
    rice: z.string().optional(),
    nuruk: z.string().optional(),
    koji: z.string().optional(),        // hybrids only
    polishRatio: z.number().optional(), // hybrids only
    water: z.string().optional(),
    extras: z.string().optional(),      // Grace: Korean pears

    // Makgeolli recipes get revised rather than renumbered.
    revision: z.number().optional(),

    abv: z.number().optional(),
    tastingNotes: z.array(z.string()).default([]),
    servingTemp: z.string().optional(),
    pairing: z.array(z.string()).default([]),
    batchNotes: z.string().optional(),
    thanks: z.string().optional(),
    artist: z.string().optional(),

    bottle: image().optional(),
    bottleAlt: image().optional(),
    labelFront: image().optional(),
    labelBack: image().optional(),
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

export const collections = { batches, makgeolli, artists, journal };
