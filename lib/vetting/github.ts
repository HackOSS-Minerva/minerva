import type { ParsedGithubRepo } from "./types";

const GITHUB_HOSTS = new Set(["github.com", "www.github.com"]);

export function parseGithubRepoUrl(rawUrl: string): ParsedGithubRepo | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (!GITHUB_HOSTS.has(url.hostname.toLowerCase())) return null;

  const [owner, repo, ...rest] = url.pathname
    .split("/")
    .filter(Boolean)
    .map((part) => part.trim());

  if (!owner || !repo) return null;
  if (rest.length > 0 && rest[0] !== "tree" && rest[0] !== "blob") {
    return null;
  }

  const cleanRepo = repo.endsWith(".git") ? repo.slice(0, -4) : repo;
  if (!cleanRepo) return null;

  return {
    owner,
    name: cleanRepo,
    canonicalUrl: `https://github.com/${owner}/${cleanRepo}`,
  };
}

export function parseGithubRateLimit(headers: Headers): {
  remaining?: number;
  resetAt?: number;
} {
  const remainingRaw = headers.get("x-ratelimit-remaining");
  const resetRaw = headers.get("x-ratelimit-reset");

  const remaining = remainingRaw === null ? undefined : Number(remainingRaw);
  const resetSeconds = resetRaw === null ? undefined : Number(resetRaw);

  return {
    remaining: Number.isFinite(remaining) ? remaining : undefined,
    resetAt:
      typeof resetSeconds === "number" && Number.isFinite(resetSeconds)
        ? resetSeconds * 1000
        : undefined,
  };
}
