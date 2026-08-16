import sharp from 'sharp';

/**
 * Partial white balance for the bottle photography.
 *
 * The bottles were shot under warm indoor light against cream walls, so every
 * frame carries a yellow cast — measured between R+4/B-6 and R+26/B-26 across
 * the set. The site's ground is a cool neutral grey, and that mismatch is most
 * of what makes the photos read as snapshots rather than product shots.
 *
 * Correcting this is not a filter: the wall is genuinely near-neutral in life,
 * so neutralising it makes the label colours MORE accurate, not less.
 *
 * Usage:  node scripts/neutralize.mjs [strength]
 */

/** Average colour of the light background, sampled from the border ring. */
export async function measureBackground(file) {
  const { data, info } = await sharp(file)
    .resize(200, 200, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const margin = Math.floor(w * 0.1);
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const onRing = x < margin || x >= w - margin || y < margin || y >= h - margin;
      if (!onRing) continue;
      const i = (y * w + x) * ch;
      /**
       * Only sample NEAR-WHITE pixels.
       *
       * The correction assumes the sampled surface should be neutral. A wall
       * qualifies; a wood table does not — it is genuinely brown, and
       * neutralising against it drains the warmth out of real wood. Batch 005
       * is shot on wood and was over-corrected at a lower threshold.
       *
       * 150 is high enough to exclude wood and shadow while still catching a
       * warm-lit white wall.
       */
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < 150) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  // Require a meaningful sample. Too few near-white pixels means there is no
  // reliable neutral reference in frame, and guessing would do more harm than
  // leaving the photo alone.
  const ringPixels = w * h - (w - 2 * margin) * (h - 2 * margin);
  if (n < ringPixels * 0.08) return null;
  return { r: r / n, g: g / n, b: b / n, coverage: n / ringPixels };
}

/**
 * Per-channel gains that move the background toward neutral.
 *
 * `strength` of 1 fully neutralises; lower keeps some original warmth so the
 * light still reads as real rather than clinical. Gains are normalised on the
 * luminance-weighted mean so overall exposure does not drift and highlights
 * do not clip.
 */
export function neutralGains(bg, strength = 0.75) {
  const avg = (bg.r + bg.g + bg.b) / 3;
  const gR = Math.pow(avg / bg.r, strength);
  const gG = Math.pow(avg / bg.g, strength);
  const gB = Math.pow(avg / bg.b, strength);
  const lw = 0.299 * gR + 0.587 * gG + 0.114 * gB;
  return [gR / lw, gG / lw, gB / lw];
}

/**
 * Largest gain spread we will accept.
 *
 * A wide spread means the sampled surface was not actually neutral, so
 * "correcting" it drags the whole frame the other way. The case that set this
 * limit: batch 004's photo samples the cloudy nigori in the bottle, which is
 * genuinely cream rather than white. At full strength that produced a 0.479
 * spread and turned warm restaurant light cold and blue — erasing the very
 * cloudiness the picture exists to show.
 */
const MAX_SPREAD = 0.28;

const spreadOf = ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b);

export async function neutralize(src, dest, strength = 0.75) {
  const bg = await measureBackground(src);
  if (!bg) return null;

  // Back the strength off until the correction is credible. If even a very
  // gentle pass overshoots, there is no neutral reference worth trusting.
  let applied = strength;
  let gains = neutralGains(bg, applied);
  while (spreadOf(gains) > MAX_SPREAD && applied > 0.1) {
    applied = Math.round((applied - 0.05) * 100) / 100;
    gains = neutralGains(bg, applied);
  }
  if (spreadOf(gains) > MAX_SPREAD) return null;
  const [gR, gG, gB] = gains;
  await sharp(src)
    .recomb([
      [gR, 0, 0],
      [0, gG, 0],
      [0, 0, gB],
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(dest);
  return { gR, gG, gB, bg, strength: applied, backedOff: applied < strength };
}
