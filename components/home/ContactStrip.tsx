import { Mail } from "lucide-react";

const EMAIL = "info@coconutlabs.org";

export function ContactStrip() {
  return (
    <section className="content-band">
      <div className="content-inner border-y border-rule py-16 text-center">
        <p className="font-serif text-[clamp(2.8rem,7vw,7rem)] leading-none">
          Building something at this layer? Write us.
        </p>
        <a
          className="focus-ring mt-8 inline-flex items-center gap-2 rounded-sm font-mono text-sm text-ink-1 transition-colors hover:text-accent"
          href={`mailto:${EMAIL}`}
        >
          <Mail aria-hidden="true" size={14} />
          {EMAIL}
        </a>
      </div>
    </section>
  );
}
