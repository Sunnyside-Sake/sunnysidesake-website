import fs from 'node:fs';

/**
 * Builds the orange-gradient variant of the vector mark.
 *
 * Takes the black-outline / white-infill SVG and swaps the arch infills for
 * the logo's horizontal gradient (#ff4537 -> #ff8449, the colours sampled from
 * the original artwork). The black outline stays, so this is the same drawing
 * with a different fill rather than a different mark.
 *
 * The gradient uses gradientUnits="userSpaceOnUse" spanning the whole arch
 * band. With the default objectBoundingBox each path would get its own
 * gradient run, so every arch would repeat the full red-to-amber sweep instead
 * of the sweep crossing the mark once.
 */
const SRC = 'src/assets/logo-mark.svg';
const OUT = 'src/assets/logo-mark-flare.svg';

/**
 * How far to lift the logo's gradient toward white, 0 = the printed colours.
 * The artwork colours were drawn to sit on a black bottle label; on a light
 * page they read heavier than intended, so the header mark is lifted.
 * Tune this one number to go lighter or darker.
 */
const LIGHTEN = 0.18;

/** Stops sampled from the original artwork, before lifting. */
const STOPS = ['#ff4537', '#ff573c', '#ff8449'];

const lift = (hex, amount) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const mix = (c) => Math.round(c * (1 - amount) + 255 * amount);
  return '#' + [mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
};

const stops = STOPS.map((c) => lift(c, LIGHTEN));

let svg = fs.readFileSync(SRC, 'utf8');

const whiteFills = (svg.match(/fill="#f{3,6}"/gi) || []).length;
svg = svg.replace(/fill="#f{3,6}"/gi, 'fill="url(#flare)"');

// x range matches the viewBox the mark was cropped to
const grad =
  '<defs><linearGradient id="flare" gradientUnits="userSpaceOnUse"' +
  ' x1="107.4" y1="0" x2="180.4" y2="0">' +
  `<stop offset="0" stop-color="${stops[0]}"/>` +
  `<stop offset="0.5" stop-color="${stops[1]}"/>` +
  `<stop offset="1" stop-color="${stops[2]}"/>` +
  '</linearGradient></defs>';

svg = svg.replace(/(<svg[^>]*>)/, (m) => m + grad);

fs.writeFileSync(OUT, svg);
console.log(`recoloured ${whiteFills} infills -> gradient`);
console.log(`wrote ${OUT}  ${svg.length} bytes`);
console.log(`stops lifted ${Math.round(LIGHTEN * 100)}% toward white: ${STOPS.join(' ')} -> ${stops.join(' ')}`);
