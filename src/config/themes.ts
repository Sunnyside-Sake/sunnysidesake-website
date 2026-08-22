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
 *   'flare'      the arch with the lifted orange gradient — the house mark
 *   'flare-wide' same, endpoints pushed apart; kept only for comparison
 *
 * The mono (black outline, white infill) variant is no longer used by any
 * theme. Its asset is still in src/assets/logo-mark.svg if it is ever wanted
 * back, and it remains the source the gradient variants are generated from.
 */
export const themes = [
  {
    id: 'hai',
    mark: 'flare',
    bg: '#e9eaeb',
    name: 'Hai',
    nameJa: '灰',
    note: 'Cool neutral light grey. A studio backdrop that lets the bottles carry the colour.',
  },
  {
    id: 'hai-plus',
    mark: 'flare',
    bg: '#c4c7ca',
    name: 'Hai ++',
    nameJa: '濃灰',
    note: 'hai pushed 30% deeper and cooler. Overcast slate — more industrial, less studio.',
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
    mark: 'flare',
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
