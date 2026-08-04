#!/usr/bin/env node
// Generates src/types/database.types.ts verbatim from the Supabase CLI.
// The file is excluded from `vp fmt` (see fmt.ignorePatterns), so the diff
// only shows real schema changes and not formatting churn.
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = join(repoRoot, "src", "types", "database.types.ts");
const source = process.argv[2] ?? "--linked";

if (!["--linked", "--local"].includes(source)) {
  console.error(`Unknown source "${source}". Use --linked (default) or --local.`);
  process.exit(1);
}

const vp = join(repoRoot, "node_modules", ".bin", "vp");
const gen = spawnSync(`"${vp}" exec supabase gen types typescript ${source} --log-level error`, {
  cwd: repoRoot,
  encoding: "utf8",
  shell: true,
});

if (gen.status !== 0) {
  console.error(gen.stderr || `supabase gen types failed with code ${gen.status}`);
  process.exit(gen.status ?? 1);
}

// Never overwrite the checked-in types with a truncated or hint-polluted file.
const types = gen.stdout;
if (!types.includes("export type Database")) {
  console.error("Unexpected output from supabase gen types:\n" + types.slice(0, 500));
  process.exit(1);
}

writeFileSync(outFile, types);
console.log(`Wrote ${outFile}`);
