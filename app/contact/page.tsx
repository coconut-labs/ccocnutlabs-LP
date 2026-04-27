import { EmailLink } from "@/components/primitives/EmailLink";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact · Coconut Labs",
  description: "Collaborate, press, and general contact for Coconut Labs.",
  path: "/contact",
});

const rows = [
  {
    title: "Collaborate",
    body: "Schedulers, traces, benchmark harnesses, and independent research threads.",
    email: "shreypatel@coconutlabs.org",
    subject: "Collaborate",
  },
  {
    title: "Press",
    body: "Short context, result verification, and links to canonical notes.",
    email: "jaypatel@coconutlabs.org",
    subject: "Press",
  },
  {
    title: "General",
    body: "A plain inbox for everything else.",
    email: "info@coconutlabs.org",
    subject: undefined,
  },
];

export default function ContactPage() {
  return (
    <section className="content-band">
      <div className="content-inner">
        <p className="font-mono text-xs uppercase text-accent-2">contact</p>
        <h1 className="mt-5 font-serif text-[clamp(4rem,10vw,9rem)] leading-[0.92]">Write the lab.</h1>
        <div className="mt-16 grid gap-5">
          {rows.map((row) => (
            <article className="grid gap-5 border-t border-rule py-7 md:grid-cols-[14rem_minmax(0,1fr)_auto]" key={row.title}>
              <h2 className="font-serif text-4xl">{row.title}</h2>
              <p className="max-w-2xl leading-7 text-ink-1">{row.body}</p>
              <EmailLink
                className="font-mono text-xs"
                email={row.email}
                subject={row.subject}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
