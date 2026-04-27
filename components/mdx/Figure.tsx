import Image from "next/image";

export function Figure({
  src,
  alt,
  caption,
  credit,
}: {
  src: string;
  alt: string;
  caption: string;
  credit?: string;
}) {
  return (
    <figure>
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-rule bg-bg-2">
        <Image alt={alt} className="object-cover" fill src={src} />
      </div>
      <figcaption className="mt-3 font-mono text-xs text-ink-2">
        {caption}
        {credit ? ` · ${credit}` : ""}
      </figcaption>
    </figure>
  );
}
