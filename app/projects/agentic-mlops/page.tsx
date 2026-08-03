import { buildMetadata } from "@/lib/seo";
import LifecycleMap from "./LifecycleMap";

export const metadata = buildMetadata({
  title: "Agentic MLOps Platform · Coconut Labs",
  description:
    "A public, explorable case study: the classic MLOps loop — register, train, gate, canary, promote, roll back — still holds when the thing served is an LLM agent.",
  path: "/projects/agentic-mlops",
});

export default function AgenticMlopsPage() {
  return (
    <>
      <section className="content-band">
        <div className="content-inner">
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink-2)",
              marginBottom: "1rem",
            }}
          >
            Working name · unassigned pending audit
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "var(--ink-0)",
              maxWidth: "18ch",
            }}
          >
            An agentic MLOps platform, built to be measured.
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1rem, 1.6vw, 1.2rem)",
              lineHeight: 1.55,
              color: "var(--ink-1)",
              maxWidth: "var(--measure)",
              marginTop: "1.5rem",
            }}
          >
            One claim runs through the whole build: the classic MLOps loop — register, train,
            gate, canary, promote, roll back — still works when the thing being served is an LLM
            agent, provided you add a fourth telemetry axis (tokens and cost) and a fifth artifact
            type (the reasoning trace). Everything below either supports that claim or is cut.
          </p>
        </div>
      </section>

      <section className="content-band pt-0">
        <div className="content-inner">
          <LifecycleMap />
        </div>
      </section>
    </>
  );
}
