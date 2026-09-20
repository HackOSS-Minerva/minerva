import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { format, resolveConfig } from "prettier";

import {
  DESCRIPTION_FILES,
  type DescriptionKey,
  type TenantInput,
} from "./schema";

export interface GeneratedFile {
  absolutePath: string;
  relativePath: string;
  content: string;
}

export interface SyncPlan {
  tenantSlugs: string[];
  processedTenantSlugs: string[];
  files: GeneratedFile[];
  changedFiles: GeneratedFile[];
}

const normalizeMdx = (content: string) => {
  if (content === "") {
    return "";
  }

  return `${content.replace(/\r\n?/g, "\n").replace(/\n+$/, "")}\n`;
};

const readExistingFile = async (absolutePath: string) => {
  try {
    return await readFile(absolutePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
};

const createGeneratedFile = (
  repoRoot: string,
  relativePath: string,
  content: string,
): GeneratedFile => ({
  absolutePath: join(repoRoot, relativePath),
  relativePath,
  content,
});

export async function buildSyncPlan(
  repoRoot: string,
  tenants: TenantInput[],
): Promise<SyncPlan> {
  const absoluteRoot = resolve(repoRoot);
  const descriptionEntries = Object.entries(DESCRIPTION_FILES) as [
    DescriptionKey,
    string,
  ][];
  const files = tenants.flatMap((tenant) => {
    const tenantDirectory = join("tenants", tenant.slug);
    const configPath = join(tenantDirectory, `${tenant.slug}.json`);
    const generatedFiles = [
      createGeneratedFile(
        absoluteRoot,
        configPath,
        `${JSON.stringify(tenant.config, null, 2)}\n`,
      ),
    ];

    for (const [key, filename] of descriptionEntries) {
      generatedFiles.push(
        createGeneratedFile(
          absoluteRoot,
          join(tenantDirectory, "descriptions", filename),
          normalizeMdx(tenant.descriptions[key]),
        ),
      );
    }

    return generatedFiles;
  });
  await Promise.all(
    files
      .filter((file) => file.relativePath.endsWith(".json"))
      .map(async (file) => {
        file.content = await format(file.content, {
          ...(await resolveConfig(file.absolutePath)),
          filepath: file.absolutePath,
        });
      }),
  );
  const changedFiles = (
    await Promise.all(
      files.map(async (file) =>
        (await readExistingFile(file.absolutePath))?.equals(
          Buffer.from(file.content),
        )
          ? undefined
          : file,
      ),
    )
  ).filter((file): file is GeneratedFile => file !== undefined);

  return {
    tenantSlugs: tenants.map((tenant) => tenant.slug),
    processedTenantSlugs: tenants.map((tenant) => tenant.slug),
    files,
    changedFiles,
  };
}

export async function applySyncPlan(plan: SyncPlan): Promise<void> {
  await Promise.all(
    plan.changedFiles.map(async (file) => {
      await mkdir(dirname(file.absolutePath), { recursive: true });
      await writeFile(file.absolutePath, file.content);
    }),
  );
}
