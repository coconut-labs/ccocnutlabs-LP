export type RouteEntry = {
  href: string;
  label: string;
  nav?: boolean;
};

export const ROUTES: RouteEntry[] = [
  { href: "/", label: "Home" },

  // Top nav (primary)
  { href: "/research", label: "Research", nav: true },
  { href: "/projects", label: "Projects", nav: true },
  { href: "/joinus",   label: "Join us",  nav: true },
  { href: "/about",    label: "About",    nav: true },
  { href: "/contact",  label: "Contact",  nav: true },

  // Hub-internal (URL-stable, not in top nav)
  { href: "/research/[slug]",   label: "Research post" },
  { href: "/projects/kvwarden", label: "KVWarden" },
  { href: "/projects/weft",     label: "Weft" },

  // Footer-only
  { href: "/colophon", label: "Colophon" },
];

export const STATIC_ROUTES = ROUTES.map((route) => route.href);

export function routeIndex(pathname: string): { page: number; total: number } {
  const normalized = pathname === "" ? "/" : pathname;
  const index = STATIC_ROUTES.findIndex((route) => route === normalized);
  return {
    page: index === -1 ? STATIC_ROUTES.length + 1 : index + 1,
    total: STATIC_ROUTES.length + 1,
  };
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://coconutlabs.org";
}
