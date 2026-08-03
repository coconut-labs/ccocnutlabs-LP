"use client";

import { useState } from "react";
import styles from "./atlas.module.css";

/* Data lifecycle — §4.2, fourteen stops. Loop-backs: 8→5 (late labels reshape
   features), 13/14→6 (promote / roll back returns traffic to serve). */
type Stop = { n: number; name: string; units: string[]; loop?: string };
const STOPS: Stop[] = [
  { n: 1, name: "Ingest", units: ["U1", "U8"] },
  { n: 2, name: "Validate", units: ["U1", "U8"] },
  { n: 3, name: "Land", units: ["U1", "U8"] },
  { n: 4, name: "Transform", units: ["U1", "U8"] },
  { n: 5, name: "Feature", units: ["U2", "U8"], loop: "↑ from 8" },
  { n: 6, name: "Serve", units: ["U4", "U8"] },
  { n: 7, name: "Capture", units: ["U5", "U6", "U7", "U8"] },
  { n: 8, name: "Label", units: ["U2", "U8"], loop: "→ 5" },
  { n: 9, name: "Monitor", units: ["U2", "U8"] },
  { n: 10, name: "Train", units: ["U2", "U8"] },
  { n: 11, name: "Gate", units: ["U2", "U8"] },
  { n: 12, name: "Canary", units: ["U3", "U8"] },
  { n: 13, name: "Promote", units: ["U3", "U8"], loop: "→ 6" },
  { n: 14, name: "Roll back", units: ["U3", "U8"], loop: "→ 6" },
];

/* Layers — §3.4. Identity is glyph + label (color-alone fails CVD, validated). */
type LayerKey = "data" | "devops" | "ai" | "swe";
const LAYERS: { key: LayerKey; name: string; glyph: string; blurb: string }[] = [
  { key: "data", name: "Data Core", glyph: styles.glyphData, blurb: "schemas · lineage · drift" },
  { key: "devops", name: "DevOps / Platform", glyph: styles.glyphDevops, blurb: "terraform · k8s · teardown" },
  { key: "ai", name: "AI", glyph: styles.glyphAi, blurb: "agents · routing · traces" },
  { key: "swe", name: "SWE Core", glyph: styles.glyphSwe, blurb: "boundaries · concurrency" },
];

/* Units — §1.2 (JD trace), §12.2 (claim + target tier), §3.4 (layer). */
type Unit = { id: string; title: string; claim: string; jd: string; tier: string; layer: LayerKey };
const UNITS: Unit[] = [
  { id: "U1", title: "Registry + lineage", layer: "data", tier: "T4", jd: "manage model registries", claim: "Promotion and rollback are gated and auditable; an ungated stage change is impossible." },
  { id: "U2", title: "Continuous-training loop", layer: "data", tier: "T4", jd: "continuous training loops", claim: "Injected drift triggers retrain → gate → promote end to end, unattended." },
  { id: "U4", title: "Agent on Kubernetes", layer: "devops", tier: "T4", jd: "deploy agents as scalable microservices", claim: "HPA on in-flight requests holds p99 under a burst where a CPU-triggered HPA does not." },
  { id: "U8", title: "IaC + teardown", layer: "devops", tier: "T3", jd: "Kubernetes, Docker, Terraform", claim: "One manifest set deploys unchanged to kind, k3s, and (by plan) EKS; live rebuilds from zero." },
  { id: "U3", title: "A/B router", layer: "ai", tier: "T4", jd: "A/B testing infrastructure", claim: "Arm assignment is stable and unbiased; a guardrail abort fires before the cost threshold breaches." },
  { id: "U5", title: "Cost plane", layer: "ai", tier: "T3", jd: "track token usage", claim: "Attributed cost reconciles with the provider's own usage figures within tolerance." },
  { id: "U7", title: "Reasoning path", layer: "ai", tier: "T3", jd: "agent reasoning paths", claim: "A run is fully reconstructable from spans alone, with no raw reasoning text stored." },
  { id: "U9", title: "Tooling comparison", layer: "ai", tier: "T3", jd: "MLflow / W&B / LangSmith", claim: "The registry choice is defensible on criteria fixed in advance, not asserted." },
  { id: "U6", title: "Latency + tail budget", layer: "swe", tier: "T4", jd: "latency", claim: "Per-hop attribution shows the platform owns ~1% of the budget; turn reduction beats code tuning." },
  { id: "U10", title: "Scale envelope", layer: "swe", tier: "T3", jd: "scalable microservice architectures", claim: "A documented capacity envelope names the actual binding constraint." },
];

export default function LifecycleMap() {
  // Active lens: either a unit (highlight its stops) or a stop (highlight its units).
  const [activeUnit, setActiveUnit] = useState<string | null>(null);
  const [activeStop, setActiveStop] = useState<number | null>(null);

  const stopClaimsUnit = (s: Stop, u: string | null) => (u ? s.units.includes(u) : false);
  const unitClaimedByStop = (u: Unit, n: number | null) =>
    n != null ? (STOPS.find((s) => s.n === n)?.units.includes(u.id) ?? false) : false;

  const activeUnitObj = UNITS.find((u) => u.id === activeUnit) ?? null;
  const stopsForActiveUnit = activeUnit
    ? STOPS.filter((s) => s.units.includes(activeUnit)).map((s) => s.n)
    : [];

  return (
    <div className={styles.wrap}>
      <section aria-label="Data lifecycle map">
        <div className={styles.mapHead}>
          <h2 className={styles.mapTitle}>The data lifecycle, fourteen stops</h2>
          <span className={styles.mapHint}>hover a stop → the units that claim it · hover a unit → the stops it owns</span>
        </div>
        <ol className={styles.ribbon}>
          {STOPS.map((s) => {
            const lit = stopClaimsUnit(s, activeUnit) || activeStop === s.n;
            const dim = activeUnit != null && !stopClaimsUnit(s, activeUnit);
            return (
              <li key={s.n} style={{ listStyle: "none" }}>
                <button
                  type="button"
                  className={`${styles.stop} ${lit ? styles.lit : ""} ${dim ? styles.dim : ""}`}
                  onMouseEnter={() => setActiveStop(s.n)}
                  onMouseLeave={() => setActiveStop(null)}
                  onFocus={() => setActiveStop(s.n)}
                  onBlur={() => setActiveStop(null)}
                  aria-label={`Stop ${s.n}, ${s.name}. Claimed by ${s.units.join(", ")}.`}
                >
                  <span className={styles.stopNum}>{String(s.n).padStart(2, "0")}</span>
                  <span className={styles.stopName}>{s.name}</span>
                  <span className={styles.stopUnits}>
                    {s.units.map((u) => (
                      <span key={u} className={styles.stopUnitTag}>{u}</span>
                    ))}
                  </span>
                  {s.loop && <span className={styles.loopFlag}>{s.loop}</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-label="Units by layer">
        <div className={styles.claimRow} aria-live="polite">
          {activeUnitObj ? (
            <span>
              <b>{activeUnitObj.id}</b> claims stops {stopsForActiveUnit.join(", ")} — {activeUnitObj.claim}
            </span>
          ) : (
            <span>Ten units, one per JD requirement. Each is built and written before the next starts.</span>
          )}
        </div>
        <div className={styles.layers} style={{ marginTop: "1rem" }}>
          {LAYERS.map((layer) => {
            const units = UNITS.filter((u) => u.layer === layer.key);
            return (
              <div key={layer.key} className={styles.layer}>
                <div className={styles.layerHead}>
                  <span className={`${styles.glyph} ${layer.glyph}`} aria-hidden />
                  <span className={styles.layerName}>{layer.name}</span>
                  <span className={styles.layerMeta}>{layer.blurb}</span>
                </div>
                {units.map((u) => {
                  const active = activeUnit === u.id || unitClaimedByStop(u, activeStop);
                  return (
                    <button
                      type="button"
                      key={u.id}
                      className={`${styles.unit} ${active ? styles.unitActive : ""}`}
                      onMouseEnter={() => setActiveUnit(u.id)}
                      onMouseLeave={() => setActiveUnit(null)}
                      onFocus={() => setActiveUnit(u.id)}
                      onBlur={() => setActiveUnit(null)}
                      aria-label={`${u.id} ${u.title}, target ${u.tier}. ${u.claim}`}
                    >
                      <span className={styles.unitTop}>
                        <span className={styles.unitId}>{u.id}</span>
                        <span className={styles.unitTitle}>{u.title}</span>
                        <span className={styles.tier}>{u.tier}</span>
                      </span>
                      <span className={styles.unitClaim}>{u.claim}</span>
                      <span className={styles.unitJd}>JD · {u.jd}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
