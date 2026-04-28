const CONTRIBUTORS_URL =
  "https://raw.githubusercontent.com/coconut-labs/kvwarden/main/CONTRIBUTORS";

/**
 * Load the canonical contributor list from coconut-labs/kvwarden/CONTRIBUTORS.
 * Newline-delimited GitHub handles. Comment lines (starting with `#`) and
 * empty lines are skipped. Build-time fetch with 1-hour ISR cache.
 *
 * Returns an empty array on any failure (including network errors and 404),
 * which the UI renders as "Just us, for now."
 */
export async function loadContributors(fetcher: typeof fetch = fetch): Promise<string[]> {
  try {
    const response = await fetcher(CONTRIBUTORS_URL, {
      next: { revalidate: 3_600 },
      headers: {
        ...(process.env.GITHUB_PAT
          ? { Authorization: `Bearer ${process.env.GITHUB_PAT}` }
          : {}),
      },
    });
    if (!response.ok) {
      return [];
    }
    const text = await response.text();
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"));
  } catch {
    return [];
  }
}
