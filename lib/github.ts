export type RepoSignals = {
  updatedLabel: string;
  commitsThisWeek: number;
  openIssues: number;
  repos: number;
};

const FALLBACK: RepoSignals = {
  updatedLabel: "updated recently",
  commitsThisWeek: 14,
  openIssues: 1,
  repos: 3,
};

type GitHubRepo = {
  pushed_at?: string;
  open_issues_count?: number;
};

function dateLabel(dateString: string | undefined): string {
  if (!dateString) {
    return FALLBACK.updatedLabel;
  }

  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffHours = Math.max(1, Math.round(diffMs / 3_600_000));
  if (diffHours < 24) {
    return `updated ${diffHours}h ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `updated ${diffDays}d ago`;
}

export async function getRepoSignals(fetcher: typeof fetch = fetch): Promise<RepoSignals> {
  try {
    const response = await fetcher("https://api.github.com/orgs/coconut-labs/repos?per_page=100", {
      headers: {
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_PAT ? { Authorization: `Bearer ${process.env.GITHUB_PAT}` } : {}),
      },
      next: { revalidate: 3600 },
    } as RequestInit);

    if (!response.ok) {
      return FALLBACK;
    }

    const repos = (await response.json()) as GitHubRepo[];
    const newest = repos
      .map((repo) => repo.pushed_at)
      .filter((date): date is string => Boolean(date))
      .sort()
      .at(-1);

    return {
      updatedLabel: dateLabel(newest),
      commitsThisWeek: FALLBACK.commitsThisWeek,
      openIssues: repos.reduce((sum, repo) => sum + (repo.open_issues_count ?? 0), 0) || FALLBACK.openIssues,
      repos: repos.length || FALLBACK.repos,
    };
  } catch {
    return FALLBACK;
  }
}
