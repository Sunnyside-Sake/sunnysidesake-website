/**
 * Printable QR codes for every batch page.
 *
 * These end up on physical labels, so the payload is effectively permanent —
 * a wrong URL is a reprint, not a redeploy. Three decisions follow from that:
 *
 *   1. TRAILING SLASH. Astro builds directory routes (/b/001/index.html), so
 *      the canonical URL is /b/001/. Encoding it without the slash works but
 *      costs a 301 on every scan; with it, the first request is the page.
 *
 *   2. ERROR CORRECTION Q (25%). The usual default is M (15%). A bottle label
 *      gets condensation, chilling and handling, and a damaged code on a
 *      printed run cannot be patched. Q buys real margin for one QR version.
 *      Level H is only worth it if a logo is ever overlaid in the centre —
 *      nothing is overlaid here, so H would just shrink the modules.
 *
 *   3. BYTE MODE, lowercase. QR alphanumeric mode is more compact but only
 *      encodes uppercase, and while the domain is case-insensitive the PATH
 *      is not: /B/001 is a 404 on GitHub Pages. Do not "optimise" by
 *      uppercasing the URL.
 *
 * Quiet zone stays at the spec minimum of 4 modules. Printing a QR flush to
 * an edge or a dark field is the most common way to make one unscannable.
 *
 * SVG is the deliverable for print; the PNG exists because label artwork is
 * assembled in Canva, which handles raster more predictably.
 *
 * Run: node scripts/make-qr.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import sharp from 'sharp';

const SITE = 'https://sunnysidesake.com';
const OUT = 'qr';
const PNG_PX = 1200; // ~100mm at 300dpi; scale down, never up

const ECC = 'Q';
const MARGIN = 4;

/** Collections that carry a QR identity, and the route each id maps to. */
const SOURCES = [
  { dir: 'src/content/batches', route: 'b' },
  { dir: 'src/content/makgeolli', route: 'm' },
];

async function targets() {
  const out = [];
  for (const { dir, route } of SOURCES) {
    for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.isDirectory()) continue;
      const md = await fs.readFile(path.join(dir, entry.name, 'index.md'), 'utf8');
      const fm = md.split(/^---$/m)[1] ?? '';
      // `id` is the QR identity and is authoritative — the folder name only
      // happens to match it today.
      const id = fm.match(/^id:\s*"?(\d{3})"?\s*$/m)?.[1];
      const name = fm.match(/^name:\s*"?(.+?)"?\s*$/m)?.[1] ?? '';
      if (!id) throw new Error(`No id in ${dir}/${entry.name}/index.md`);
      out.push({ id, name, route, url: `${SITE}/${route}/${id}/` });
    }
  }
  return out;
}

const run = async () => {
  await fs.mkdir(OUT, { recursive: true });
  const list = await targets();
  const results = [];

  for (const t of list) {
    const stem = `${t.route}-${t.id}`;

    const svg = await QRCode.toString(t.url, {
      type: 'svg',
      errorCorrectionLevel: ECC,
      margin: MARGIN,
      color: { dark: '#000000', light: '#ffffff' },
    });
    await fs.writeFile(path.join(OUT, `${stem}.svg`), svg);

    const png = await QRCode.toBuffer(t.url, {
      type: 'png',
      errorCorrectionLevel: ECC,
      margin: MARGIN,
      width: PNG_PX,
      color: { dark: '#000000', light: '#ffffff' },
    });
    await fs.writeFile(path.join(OUT, `${stem}.png`), png);

    // Decode what was actually written. An encoder that silently mangles the
    // payload, or a margin that clips, both produce a file that looks fine
    // and scans wrong — the only way to know is to read it back.
    const { data, info } = await sharp(png)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height);

    if (!decoded) throw new Error(`${stem}: generated QR could not be decoded`);
    if (decoded.data !== t.url) {
      throw new Error(`${stem}: decoded "${decoded.data}" but expected "${t.url}"`);
    }

    const modules = QRCode.create(t.url, { errorCorrectionLevel: ECC }).modules.size;
    results.push({ ...t, stem, modules, version: (modules - 17) / 4 });
  }

  const w = Math.max(...results.map((r) => r.url.length));
  for (const r of results) {
    console.log(
      `  ${r.stem}  ${r.url.padEnd(w)}  v${String(r.version).padStart(2)} ` +
        `(${r.modules}x${r.modules})  ECC ${ECC}  verified`
    );
  }
  console.log(`\n  ${results.length} codes → ${OUT}/  (svg + png each)`);
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
