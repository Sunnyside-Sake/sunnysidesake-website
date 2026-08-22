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

let svg = fs.readFileSync(SRC, 'utf8');

const whiteFills = (svg.match(/fill="#f{3,6}"/gi) || []).length;
svg = svg.replace(/fill="#f{3,6}"/gi, 'fill="url(#flare)"');

// x range matches the viewBox the mark was cropped to
const grad =
  '<defs><linearGradient id="flare" gradientUnits="userSpaceOnUse"' +
  ' x1="107.4" y1="0" x2="180.4" y2="0">' +
  '<stop offset="0" stop-color="#ff4537"/>' +
  '<stop offset="0.5" stop-color="#ff573c"/>' +
  '<stop offset="1" stop-color="#ff8449"/>' +
  '</linearGradient></defs>';

svg = svg.replace(/(<svg[^>]*>)/, (m) => m + grad);

fs.writeFileSync(OUT, svg);
console.log(`recoloured ${whiteFills} infills -> gradient`);
console.log(`wrote ${OUT}  ${svg.length} bytes`);
