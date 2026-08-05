// Parity gate: the TS port must reproduce results/guardrail.json's verdicts.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { fitProfile, check, schemaControlFlags, CORRUPTIONS, type Dataset } from "../app/projects/silent-data-regression-guardrail/guardrail.ts";

const here = dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(readFileSync(join(here, "../app/projects/silent-data-regression-guardrail/sample.json"), "utf8"));
const clean: Dataset = { columns: ["s", "a", "e", "f", "t"], rows: raw.rows };
const profile = fitProfile(clean);

const cleanV = check(profile, clean);
console.log(`clean sample: guardrail FP=${cleanV.length > 0} control FP=${schemaControlFlags(profile, clean)}`);

let gN = 0, cN = 0;
for (const c of CORRUPTIONS) {
  const bad = c.fn(clean);
  const g = check(profile, bad);
  const ctrl = schemaControlFlags(profile, bad);
  gN += g.length > 0 ? 1 : 0;
  cN += ctrl ? 1 : 0;
  console.log(`${c.id.padEnd(22)} guardrail=${g.length > 0 ? "CAUGHT" : "missed"} control=${ctrl ? "CAUGHT" : "missed"} kinds=[${[...new Set(g.map((v) => v.kind))].join(",")}]`);
}
console.log(`\nTOTAL: guardrail ${gN}/${CORRUPTIONS.length}  control ${cN}/${CORRUPTIONS.length}`);
const ok = gN === 6 && cN === 1 && cleanV.length === 0 && !schemaControlFlags(profile, clean);
console.log(ok ? "PARITY OK (matches results/guardrail.json: 6/6 vs 1/6, no FP)" : "PARITY MISMATCH");
process.exit(ok ? 0 : 1);
