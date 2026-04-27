const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coconutlabs.org";
const response = await fetch(`${baseUrl}/rss.xml`);

if (!response.ok) {
  throw new Error(`Feed request failed with ${response.status}`);
}

const text = await response.text();

if (!text.includes("<feed") || !text.includes("<entry>")) {
  throw new Error("Feed did not look like Atom with at least one entry");
}

console.log("Feed shape looks valid.");
