import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
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

const registryContent = {
  headers: [
    ["participant", "participants", DESCRIPTION_FILES.mdx_participants],
    ["judge", "judges", DESCRIPTION_FILES.mdx_judges],
    ["speaker", "speakers", DESCRIPTION_FILES.mdx_speakers],
    ["superadmin", "superadmins", DESCRIPTION_FILES.mdx_superadmins],
    ["volunteer", "volunteers", DESCRIPTION_FILES.mdx_volunteers],
    ["feedback", "feedback", DESCRIPTION_FILES.mdx_feedback],
    ["submission", "submission", DESCRIPTION_FILES.mdx_submission],
  ],
  markdown: [
    ["rules", "rules", DESCRIPTION_FILES.mdx_rules],
    ["codeOfConduct", "code_of_conduct", DESCRIPTION_FILES.mdx_code_of_conduct],
    ["venue", "venue", DESCRIPTION_FILES.mdx_venue],
    [
      "orientation",
      "judge_orientation",
      DESCRIPTION_FILES.mdx_judge_orientation,
    ],
  ],
} as const;

const getTenantIdentifier = (slug: string) =>
  `tenant_${slug.replace(/[^A-Za-z0-9_$]/g, "_")}`;

const getObjectKey = (slug: string) =>
  /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(slug) ? slug : JSON.stringify(slug);

const renderRegistry = (tenantSlugs: string[]) => {
  const imports = tenantSlugs.flatMap((slug) => {
    const identifier = getTenantIdentifier(slug);
    const tenantPath = `@/tenants/${slug}`;

    return [
      `import ${identifier}_config from ${JSON.stringify(`${tenantPath}/${slug}.json`)};`,
      ...Object.values(registryContent).flatMap((entries) =>
        entries.map(
          ([, suffix, filename]) =>
            `import ${identifier}_${suffix} from ${JSON.stringify(`${tenantPath}/descriptions/${filename}`)};`,
        ),
      ),
    ];
  });
  const configs = tenantSlugs.map((slug) => {
    const identifier = getTenantIdentifier(slug);
    return `  ${getObjectKey(slug)}: ${identifier}_config,`;
  });
  const content = tenantSlugs.flatMap((slug) => {
    const identifier = getTenantIdentifier(slug);
    const sections = Object.entries(registryContent).flatMap(
      ([section, entries]) => [
        `    ${section}: {`,
        ...entries.map(
          ([key, suffix]) => `      ${key}: ${identifier}_${suffix},`,
        ),
        "    },",
      ],
    );

    return [`  ${getObjectKey(slug)}: {`, ...sections, "  },"];
  });

  return `${imports.join("\n")}\n\nexport const tenantSlugs = [${tenantSlugs.map((slug) => JSON.stringify(slug)).join(", ")}] as const;\n\nexport const tenantConfigs = {\n${configs.join("\n")}\n};\n\nexport const tenantContent = {\n${content.join("\n")}\n} as const;\n`;
};

const getExistingTenantSlugs = async (repoRoot: string) => {
  try {
    const entries = await readdir(join(repoRoot, "tenants"), {
      withFileTypes: true,
    });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
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
  const tenantSlugs = [
    ...new Set([
      ...(await getExistingTenantSlugs(absoluteRoot)),
      ...tenants.map((tenant) => tenant.slug),
    ]),
  ].sort();
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
  files.push(
    createGeneratedFile(
      absoluteRoot,
      "tenants/generated.ts",
      renderRegistry(tenantSlugs),
    ),
  );
  await Promise.all(
    files
      .filter(
        (file) =>
          file.relativePath.endsWith(".json") ||
          file.relativePath === "tenants/generated.ts",
      )
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
    tenantSlugs,
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
