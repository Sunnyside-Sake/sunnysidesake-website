import fs from 'node:fs';
import path from 'node:path';
import { z } from 'astro/zod';

/**
 * Fermentation readings live in a sidecar CSV next to each batch's index.md:
 *
 *   src/content/batches/006/readings.csv
 *
 * CSV rather than YAML frontmatter because readings are tabular and get long —
 * this takes a straight paste out of a spreadsheet and opens in Numbers/Excel.
 * See PLAN.md §7.
 *
 * Parsed at BUILD TIME only. Nothing here ships to the browser; the charts are
 * pre-rendered SVG. Someone scanning a QR code off a bottle is on mobile in a bar
 * on bad signal — they get static markup, no chart library.
 */

/** Moromi stage markers, annotated onto the timeline. */
export const STAGES = ['hatsuzoe', 'odori', 'nakazoe', 'tomezoe'] as const;
export type Stage = (typeof STAGES)[number];

/** Blank cells are legitimate — not every reading measures everything. */
const optionalNumber = z
  .string()
  .transform((s) => s.trim())
  .transform((s) => (s === '' ? undefined : Number(s)))
  .refine((n) => n === undefined || Number.isFinite(n), 'Expected a number or an empty cell');

const readingSchema = z.object({
  day: z.coerce.number().int(),
  date: z.coerce.date().optional(),
  temp: optionalNumber,
  ph: optionalNumber,
  baume: optionalNumber,
  brix: optionalNumber,
  smv: optionalNumber,
  stage: z
    .string()
    .transform((s) => s.trim().toLowerCase())
    .transform((s) => (s === '' ? undefined : s))
    .refine(
      (s) => s === undefined || (STAGES as readonly string[]).includes(s),
      `stage must be blank or one of: ${STAGES.join(', ')}`
    )
    .transform((s) => s as Stage | undefined),
});

export type Reading = z.infer<typeof readingSchema>;

const BATCHES_DIR = path.join(process.cwd(), 'src', 'content', 'batches');

function splitLine(line: string): string[] {
  return line.split(',').map((cell) => cell.trim());
}

/**
 * Read and validate one batch's readings.
 * Returns [] when the batch has no readings.csv — legitimate for a batch that
 * hasn't started logging yet.
 */
export function loadReadings(batchId: string): Reading[] {
  const csvPath = path.join(BATCHES_DIR, batchId, 'readings.csv');
  if (!fs.existsSync(csvPath)) return [];

  const raw = fs.readFileSync(csvPath, 'utf-8').trim();
  if (!raw) return [];

  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== '');
  const header = splitLine(lines[0]).map((h) => h.toLowerCase());

  const rows = lines.slice(1).map((line, i) => {
    const cells = splitLine(line);
    const record: Record<string, string> = {};
    header.forEach((key, col) => {
      record[key] = cells[col] ?? '';
    });

    const parsed = readingSchema.safeParse(record);
    if (!parsed.success) {
      // Fail the build loudly and point at the exact file and line. A silently
      // dropped reading would be worse than a broken build.
      throw new Error(
        `Invalid reading in ${csvPath} (line ${i + 2}): ${parsed.error.issues
          .map((issue) => `${issue.path.join('.')} — ${issue.message}`)
          .join('; ')}`
      );
    }
    return parsed.data;
  });

  return rows.sort((a, b) => a.day - b.day);
}

/** Readings that carry a stage marker, for annotating the chart timeline. */
export function stageMarkers(readings: Reading[]): { day: number; stage: Stage }[] {
  return readings
    .filter((r): r is Reading & { stage: Stage } => r.stage !== undefined)
    .map((r) => ({ day: r.day, stage: r.stage }));
}

/** Min/max for one series, ignoring blank cells. Returns null if fully empty. */
export function extent(
  readings: Reading[],
  key: 'temp' | 'ph' | 'baume' | 'brix' | 'smv'
): { min: number; max: number } | null {
  const values = readings
    .map((r) => r[key])
    .filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
}
