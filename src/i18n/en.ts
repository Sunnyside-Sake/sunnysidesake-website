/**
 * ALL user-facing UI strings live here. Never inline English in a component.
 *
 * This is the single discipline that keeps a future /ja/ tree cheap. See PLAN.md §4:
 * accents now, a scoped Japanese subset later (brand + process + batches, NOT the
 * journal). Adding Japanese should be `ja.ts` plus routing config — not a hunt through
 * every template for hardcoded strings.
 */

export const en = {
  locale: 'en',

  brand: {
    name: 'Sunnyside Sake',
    nameJa: 'サニーサイド',
    tagline: 'Small-batch experimental sake. Every batch published in full.',
  },

  nav: {
    batches: 'Batches',
    artists: 'Artists',
    journal: 'Journal',
    about: 'About',
  },

  home: {
    activeBatchLabel: 'Currently fermenting',
    latestReleaseLabel: 'Latest release',
    viewBatch: 'View brew data',
  },

  batches: {
    title: 'Batches',
    // Framing, not concealment — see PLAN.md §2.
    intro: 'R&D batches, published in full. Every reading, every mistake.',
    empty: 'No batches published yet.',
    released: 'Released',
    active: 'Active',
    batchNumber: 'Batch',
  },

  batch: {
    thesisLabel: 'What we were trying',
    vitalsLabel: 'Vitals',
    sensoryLabel: 'Tasting',
    dataLabel: 'Fermentation data',
    notesLabel: 'Batch notes',
    labelArtBy: 'Label art by',

    rice: 'Rice',
    polishRatio: 'Polishing ratio',
    koji: 'Koji',
    yeast: 'Yeast',
    abv: 'ABV',
    smv: 'SMV',
    acidity: 'Acidity',
    brewStarted: 'Brew started',
    released: 'Released',
    servingTemp: 'Serving temp',
    pairing: 'Pairs with',

    // Moromi stages — the three-step addition. Left in Japanese deliberately;
    // this is the accent strategy, and the audience reads these natively.
    stages: {
      hatsuzoe: 'Hatsuzoe 初添',
      nakazoe: 'Nakazoe 仲添',
      tomezoe: 'Tomezoe 留添',
      odori: 'Odori 踊り',
    },

    day: 'Day',
    noReadings: 'No readings recorded for this batch.',
    stillFermenting: 'This batch is still fermenting. Data updates as readings come in.',
  },

  artists: {
    title: 'Artists',
    intro: 'Every batch gets a label. Every label gets an artist.',
    empty: 'No collaborations published yet.',
    batchesBy: 'Batches with',
  },

  journal: {
    title: 'Journal',
    empty: 'Nothing posted yet.',
    readMore: 'Read',
  },

  about: {
    title: 'About',
  },

  newsletter: {
    heading: 'Get notified when a batch drops',
    placeholder: 'you@example.com',
    submit: 'Subscribe',
  },

  footer: {
    responsibly: 'Please drink responsibly.',
    rights: 'All rights reserved.',
  },

  meta: {
    defaultDescription:
      'Small-batch experimental sake from Sunnyside. Every batch published in full — fermentation data, tasting notes, and label collaborations.',
  },
} as const;

export type Strings = typeof en;
export const t = en;
