/**
 * Theme registry.
 *
 * Themes are token swaps defined in src/styles/themes.css. This file is the
 * single source of truth for which exist and which one ships.
 *
 * To change the production theme, edit `defaultTheme` — one line, no component
 * changes. The dev-only switcher lets you compare them side by side without
 * touching this.
 */

/**
 * `mark` selects which logo variant the theme shows:
 *   'mono'  black outline, white infill (the WRKY white-ground artwork)
 *   'flare' the same drawing with the orange gradient infill
 * Both are rendered into the page and CSS picks one, so the dev switcher can
 * flip them at runtime without a rebuild.
 */
export const themes = [
  {
    id: 'ember',
    mark: 'mono',
    bg: '#0b0a09',
    name: 'Ember',
    nameJa: '熾火',
    note: 'Warm near-black, glowing orange. Derived straight from the logo.',
  },
  {
    id: 'sumi',
    mark: 'mono',
    bg: '#08080a',
    name: 'Sumi',
    nameJa: '墨',
    note: 'Cooler, flatter, near-monochrome. Orange rationed to live data only.',
  },
  {
    id: 'kohaku',
    mark: 'mono',
    bg: '#12100c',
    name: 'Kohaku',
    nameJa: '琥珀',
    note: 'Amber and cellar-warm. Reads aged rather than alert.',
  },
  {
    id: 'hai',
    mark: 'mono',
    bg: '#e9eaeb',
    name: 'Hai',
    nameJa: '灰',
    note: 'Cool neutral light grey. A studio backdrop that lets the bottles carry the colour.',
  },
  {
    id: 'hai-plus',
    mark: 'mono',
    bg: '#c4c7ca',
    name: 'Hai ++',
    nameJa: '濃灰',
    note: 'hai pushed 30% deeper and cooler. Overcast slate — more industrial, less studio.',
  },
  {
    id: 'hai-flare',
    bg: '#e9eaeb',
    mark: 'flare',
    name: 'Hai Flare',
    nameJa: '灰火',
    note: 'hai exactly, but the mark carries the logo gradient instead of the outline.',
  },
  {
    id: 'hai-flare-wide',
    bg: '#e9eaeb',
    mark: 'flare-wide',
    name: 'Hai Flare (wide)',
    nameJa: '灰火・広',
    note: 'Gradient endpoints pushed apart to make the sweep register at small size.',
  },
  {
    id: 'kura',
    mark: 'mono',
    bg: '#f7f4ee',
    name: 'Kura',
    nameJa: '蔵',
    note: 'Light paper stock, deep charcoal. The genuine opposite direction.',
  },
] as const;

export type ThemeId = (typeof themes)[number]['id'];

/**
 * Ground colour per theme, mirrored from themes.css. Used for the
 * <meta name="theme-color"> tag, which tints mobile browser chrome — a
 * hardcoded value there shows the wrong colour the moment the default
 * theme changes. Keep in sync when editing a theme's --color-ink-950.
 */
export const themeBg = Object.fromEntries(themes.map((t) => [t.id, t.bg])) as Record<
  ThemeId,
  string
>;

/** The theme a production build ships with. */
export const defaultTheme: ThemeId = 'hai';
