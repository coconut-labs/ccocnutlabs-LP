// TS port of the silent-cache-miss guardrail (silent-cache-miss-guardrail repo).
// Same workload, cache rules, key configs, guardrail and functional control, so
// the same inputs yield the same hit ratios and the same verdicts as the Python.
// Written index-safe for `noUncheckedIndexedAccess`.

export type Request = { query: string; tokens: number; ts: number; requestId: string };

// --- workload: a deterministic warm request stream (mirrors workload/generate.py) ---
export const MIN_CACHEABLE_TOKENS = 1024; // Anthropic's documented Opus 4.8 / Sonnet minimum
export const NORMAL_TOKENS = 1200;
export const BELOW_MIN_TOKENS = 400;

export const DISTINCT_QUERIES: string[] = Array.from(
  { length: 12 },
  (_, i) => `SYSTEM: answer from context.\nDOC #${i}: the recurring hot prompt number ${i}.`,
);

export function generate(n = 240, tokens = NORMAL_TOKENS): Request[] {
  const k = DISTINCT_QUERIES.length;
  const stream: Request[] = [];
  for (let i = 0; i < n; i++) {
    const idx = (i * 7 + 3) % k;
    const query = DISTINCT_QUERIES[idx] ?? "";
    stream.push({ query, tokens, ts: i, requestId: `req-${i}` });
  }
  return stream;
}

// --- the expensive op: pure function of the query, small-int fingerprint ---
export function embed(query: string): number {
  let sum = 0;
  for (let i = 0; i < query.length; i++) sum += query.charCodeAt(i);
  return sum % 1000;
}

// --- key configs (mirrors workload/keying.py). Returns [key, cacheableTokens]. ---
export type KeyFn = (r: Request) => [string, number];

export const canonical: KeyFn = (r) => [r.query, r.tokens];
export const volatileTimestamp: KeyFn = (r) => [`${r.ts}:${r.query}`, r.tokens];
export const volatileRequestId: KeyFn = (r) => [`${r.requestId}:${r.query}`, r.tokens];
export const belowMinimum: KeyFn = (r) => [r.query, BELOW_MIN_TOKENS];

export const CONFIGS: { name: string; keyFn: KeyFn; buggy: boolean }[] = [
  { name: "canonical", keyFn: canonical, buggy: false },
  { name: "volatile_timestamp", keyFn: volatileTimestamp, buggy: true },
  { name: "volatile_request_id", keyFn: volatileRequestId, buggy: true },
  { name: "below_minimum", keyFn: belowMinimum, buggy: true },
];

// --- the faithful prompt cache: exact match + minimum length, both silent ---
export type RunResult = {
  config: string;
  hits: number;
  misses: number;
  realCalls: number;
  hitRatio: number;
  outputs: number[];
};

export function runModeled(stream: Request[], keyFn: KeyFn, config: string): RunResult {
  const store = new Map<string, number>();
  let hits = 0;
  let misses = 0;
  const outputs: number[] = [];
  for (const r of stream) {
    const [key, tokens] = keyFn(r);
    const cached = store.get(key);
    if (cached !== undefined) {
      hits++;
      outputs.push(cached);
      continue;
    }
    misses++;
    const value = embed(r.query); // always correct, regardless of the key
    if (tokens >= MIN_CACHEABLE_TOKENS) store.set(key, value); // else: silent no-op
    outputs.push(value);
  }
  const total = hits + misses;
  return { config, hits, misses, realCalls: misses, hitRatio: total ? hits / total : 0, outputs };
}

// Per-request trace (for the live demo): did each request hit or miss?
export type TraceRow = { i: number; query: string; key: string; hit: boolean };

export function traceModeled(stream: Request[], keyFn: KeyFn): TraceRow[] {
  const store = new Map<string, number>();
  const rows: TraceRow[] = [];
  stream.forEach((r, i) => {
    const [key, tokens] = keyFn(r);
    const hit = store.has(key);
    if (!hit) {
      const value = embed(r.query);
      if (tokens >= MIN_CACHEABLE_TOKENS) store.set(key, value);
    }
    rows.push({ i, query: r.query, key, hit });
  });
  return rows;
}

// --- the guardrail: warm-workload hit ratio must clear a floor ---
export type Violation = { kind: string; detail: string };

export function checkHitRatio(hitRatio: number, total: number, threshold = 0.5): Violation[] {
  if (total <= 0) return [];
  if (hitRatio < threshold) {
    return [
      {
        kind: "silent_cache_miss",
        detail: `cache-hit ratio ${(hitRatio * 100).toFixed(0)}% on a warm workload (< ${(threshold * 100).toFixed(0)}% floor)`,
      },
    ];
  }
  return [];
}

// --- the control: functional correctness (passes even when nothing caches) ---
export function functionalControlFlags(stream: Request[], result: RunResult): boolean {
  for (let i = 0; i < stream.length; i++) {
    const r = stream[i];
    const got = result.outputs[i];
    if (r === undefined || got === undefined) continue;
    if (got !== embed(r.query)) return true;
  }
  return false;
}
