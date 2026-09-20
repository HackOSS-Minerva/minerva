import { applySyncPlan, type SyncPlan } from "./generate";

export type CommandRunner = (
  program: string,
  args: string[],
  options?: { cwd?: string },
) => Promise<{ exitCode: number; stdout: string; stderr: string }>;

// Keep the Bun-only CLI independent of a new @types/bun dependency.
declare const Bun: {
  spawn(options: {
    cmd: string[];
    cwd?: string;
    stdout: "pipe";
    stderr: "pipe";
  }): {
    exited: Promise<number>;
    stdout: ReadableStream<Uint8Array>;
    stderr: ReadableStream<Uint8Array>;
  };
};

const runCommand: CommandRunner = async (program, args, options) => {
  const process = Bun.spawn({
    cmd: [program, ...args],
    cwd: options?.cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    process.exited,
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
  ]);
  return { exitCode, stdout, stderr };
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const checkedCommand = async (
  repoRoot: string,
  run: CommandRunner,
  requirement: string,
  program: string,
  args: string[],
) => {
  try {
    const result = await run(program, args, { cwd: repoRoot });
    if (result.exitCode !== 0) {
      throw new Error(
        result.stderr.trim() ||
          result.stdout.trim() ||
          `command exited with code ${result.exitCode}`,
      );
    }
    return result.stdout.trim();
  } catch (error) {
    throw new Error(`${requirement}: ${errorMessage(error)}`);
  }
};

export async function assertPublishPreconditions(
  repoRoot: string,
  run: CommandRunner = runCommand,
): Promise<void> {
  const branch = await checkedCommand(
    repoRoot,
    run,
    "Must be on the main branch",
    "git",
    ["branch", "--show-current"],
  );
  if (branch !== "main") {
    throw new Error("Must be on the main branch before syncing tenants.");
  }

  const status = await checkedCommand(
    repoRoot,
    run,
    "Must have a clean worktree",
    "git",
    ["status", "--porcelain"],
  );
  if (status !== "") {
    throw new Error("Must have a clean worktree before syncing tenants.");
  }

  await checkedCommand(repoRoot, run, "Must fetch origin/main", "git", [
    "fetch",
    "origin",
    "main",
  ]);
  const head = await checkedCommand(
    repoRoot,
    run,
    "Must resolve main HEAD",
    "git",
    ["rev-parse", "HEAD"],
  );
  const remoteHead = await checkedCommand(
    repoRoot,
    run,
    "Must resolve origin/main",
    "git",
    ["rev-parse", "origin/main"],
  );
  if (head !== remoteHead) {
    throw new Error(
      "Local main must match origin/main before syncing tenants.",
    );
  }

  await checkedCommand(
    repoRoot,
    run,
    "GitHub CLI authentication is required",
    "gh",
    ["auth", "status"],
  );
}

export function buildBranchName(now: Date): string {
  const timestamp = now.toISOString();
  const date = timestamp.slice(0, 10).replaceAll("-", "");
  const time = timestamp.slice(11, 19).replaceAll(":", "");
  return `fardinzam/tenant-sync-${date}-${time}`;
}

export function buildPullRequest(
  branch: string,
  processedTenantSlugs: string[],
) {
  return {
    base: "main",
    head: branch,
    title: "chore(tenants): sync configuration",
    body: [
      "### Context",
      "",
      "Sync tenant configuration and Markdown content from the supplied CSV.",
      "",
      "### Core Changes",
      "",
      "- Update tenant configuration and description files from validated CSV rows.",
      `- Processed tenants: ${processedTenantSlugs.join(", ")}.`,
      "",
      "### Testing & Verification",
      "",
      "- Validated CSV headers, tenant fields, and time ranges before generating files.",
      "- Compared generated content with existing files and staged only changed paths.",
      "",
      "### Impact & Edge Cases",
      "",
      "None.",
    ].join("\n"),
  };
}

export async function publishPlan(
  repoRoot: string,
  plan: SyncPlan,
  now: Date = new Date(),
  run: CommandRunner = runCommand,
): Promise<string> {
  await assertPublishPreconditions(repoRoot, run);
  const branch = buildBranchName(now);
  const pr = buildPullRequest(branch, plan.processedTenantSlugs);
  await checkedCommand(repoRoot, run, "Could not create sync branch", "git", [
    "switch",
    "-c",
    branch,
  ]);
  await applySyncPlan(plan);
  await checkedCommand(repoRoot, run, "Could not stage tenant changes", "git", [
    "add",
    "--",
    ...plan.changedFiles.map((file) => file.relativePath),
  ]);
  await checkedCommand(
    repoRoot,
    run,
    "Could not commit tenant changes",
    "git",
    ["commit", "-m", pr.title],
  );
  await checkedCommand(repoRoot, run, "Could not push sync branch", "git", [
    "push",
    "--set-upstream",
    "origin",
    branch,
  ]);

  try {
    return await checkedCommand(repoRoot, run, "Could not create PR", "gh", [
      "pr",
      "create",
      "--base",
      pr.base,
      "--head",
      pr.head,
      "--title",
      pr.title,
      "--body",
      pr.body,
    ]);
  } catch (error) {
    throw new Error(
      `${errorMessage(error)}. Pushed branch preserved: ${branch}.`,
    );
  }
}
