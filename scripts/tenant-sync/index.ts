import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { buildSyncPlan } from "./generate";
import { publishPlan, type CommandRunner } from "./git";
import { parseTenantCsv } from "./schema";

const usage = "Usage: bun run tenant:sync <csv-path> [--dry-run] | --help";

export async function runTenantSync(
  args: string[],
  cwd: string = process.cwd(),
  run?: CommandRunner,
): Promise<number> {
  try {
    if (args.length === 1 && args[0] === "--help") {
      console.log(usage);
      return 0;
    }

    const paths = args.filter((arg) => !arg.startsWith("-"));
    const dryRun = args.includes("--dry-run");
    if (
      paths.length !== 1 ||
      args.length !== (dryRun ? 2 : 1) ||
      args.some((arg) => arg.startsWith("-") && arg !== "--dry-run")
    ) {
      throw new Error(usage);
    }

    const repoRoot = resolve(cwd);
    const source = await readFile(resolve(repoRoot, paths[0]), "utf8");
    const tenants = parseTenantCsv(source);
    const plan = await buildSyncPlan(repoRoot, tenants);

    if (dryRun) {
      console.log(
        `Processed tenants: ${tenants.map((tenant) => tenant.slug).join(", ") || "(none)"}`,
      );
      console.log("Changed paths:");
      for (const file of plan.changedFiles) {
        console.log(`- ${file.relativePath}`);
      }
    }

    if (plan.changedFiles.length === 0) {
      console.log("Tenant configuration is already up to date.");
      return 0;
    }
    if (dryRun) {
      return 0;
    }

    const url = await publishPlan(repoRoot, plan, new Date(), run);
    console.log(`Created pull request: ${url}`);
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if ((import.meta as ImportMeta & { main?: boolean }).main) {
  process.exitCode = await runTenantSync(process.argv.slice(2));
}
