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

export const themes = [
  {
    id: 'ember',
    name: 'Ember',
    nameJa: '熾火',
    note: 'Warm near-black, glowing orange. Derived straight from the logo.',
  },
  {
    id: 'sumi',
    name: 'Sumi',
    nameJa: '墨',
    note: 'Cooler, flatter, near-monochrome. Orange rationed to live data only.',
  },
  {
    id: 'kohaku',
    name: 'Kohaku',
    nameJa: '琥珀',
    note: 'Amber and cellar-warm. Reads aged rather than alert.',
  },
  {
    id: 'hai',
    name: 'Hai',
    nameJa: '灰',
    note: 'Cool neutral light grey. A studio backdrop that lets the bottles carry the colour.',
  },
  {
    id: 'kura',
    name: 'Kura',
    nameJa: '蔵',
    note: 'Light paper stock, deep charcoal. The genuine opposite direction.',
  },
] as const;

export type ThemeId = (typeof themes)[number]['id'];

/** The theme a production build ships with. */
export const defaultTheme: ThemeId = 'ember';
