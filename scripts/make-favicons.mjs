import sharp from 'sharp';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

/**
 * Generates the favicon set from the flare mark.
 *
 * Design deliberately unchanged from the header mark. Tested at 16px and 32px
 * against light, dark and grey tab backgrounds: the outline disappears by 16px
 * so a "simplified" solid version looks identical there, while at 32px the
 * outline actually helps by separating the arches. The mark already degrades
 * gracefully, so there is nothing to simplify.
 *
 * Orange rather than the mono variant because colour is the fastest
 * recognition cue in a crowded tab strip, and it matches the header.
 *
 * Outputs:
 *   favicon.svg      - primary; the browser rasterises at whatever size it
 *                      needs (16/32/48/64 in different contexts) rather than
 *                      downscaling one fixed bitmap
 *   favicon-32.png   - fallback for browsers without SVG icon support
 *   favicon-180.png  - apple-touch-icon, which must be PNG and needs an
 *                      opaque ground: iOS composites it onto the home screen
 *                      with no transparency handling
 *   favicon-512.png  - og:image / PWA manifest size
 */

const SRC = 'src/assets/logo-mark-flare.svg';
const src = fs.readFileSync(SRC, 'utf8');

// The mark's viewBox is taller than it is wide; square it so browsers and iOS
// do not letterbox or stretch the icon.
const VB = { x: 107.4, y: 215.4, w: 73.0, h: 85.2 };
const side = VB.h * 1.1; // ~10% breathing room
const squared = src.replace(
  /viewBox="[^"]*"/,
  `viewBox="${(VB.x + VB.w / 2 - side / 2).toFixed(2)} ${(VB.y + VB.h / 2 - side / 2).toFixed(2)} ${side.toFixed(2)} ${side.toFixed(2)}"`
);

fs.writeFileSync('public/favicon.svg', squared);

/**
 * Run svgo over it. The Canva export carries transforms (matrix/translate),
 * so path coordinates do not reflect where anything actually renders — culling
 * "off-canvas" paths by bounding box silently changes the image. svgo resolves
 * transforms properly, which is why it can halve the file with a verified
 * pixel-identical result where hand-rolled culling could not.
 */
execSync('npx svgo --multipass --quiet -i public/favicon.svg -o public/favicon.svg');
const svgSize = fs.statSync('public/favicon.svg').size;
console.log(`public/favicon.svg  ${squared.length} -> ${svgSize} bytes (svgo)`);

for (const [size, opaque] of [
  [32, false],
  [180, true], // apple-touch-icon: iOS gives it no transparency handling
  [512, false],
]) {
  const mark = await sharp(Buffer.from(squared), { density: 1600 })
    .resize({ height: Math.round(size * 0.88) })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: opaque ? '#e9eaeb' : { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(`public/favicon-${size}.png`);
  const s = fs.statSync(`public/favicon-${size}.png`).size;
  console.log(`public/favicon-${size}.png  ${s} bytes${opaque ? '  (opaque ground for iOS)' : ''}`);
}
