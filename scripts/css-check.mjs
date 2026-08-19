#!/usr/bin/env node
// Guards the structure of src/css: one file per page or component, named after
// the module that renders it, imported in a layered cascade order.
//
// Four checks run by default and fail the command:
//   imports    every file imported exactly once, none missing, none empty
//   dead-rules a rule whose every class is rendered by nothing
//   dead-vars  a custom property nothing reads
//   headers    every file states who renders it
//
// Two more report but never fail, because they need a human call:
//   duplicate-selectors  the same selector declared in more than one file
//   split-ownership      a comma group whose halves belong to different modules
// Known-good cases are listed in ALLOW below; anything else shows as a warning.
//
// A fifth check answers the question that matters when moving rules around:
// "can this change what the page looks like?" Reordering CSS is only observable
// when two rules that can hit the same element declare the same property with
// different values, and swap. So snapshot before refactoring and compare after:
//
//   node scripts/css-check.mjs --snapshot .css-baseline.json
//   … move rules around …
//   node scripts/css-check.mjs --against .css-baseline.json
//
// Renaming a class is not a cascade change but looks like one, so pass a map to
// fold the old names into the new: --renames renames.json, {"old-name":"new-name"}.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, sep } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = join(repoRoot, "src");
const cssRoot = join(srcRoot, "css");

// ── Known-good exceptions ────────────────────────────────────────────────────
const ALLOW = {
  duplicateSelectors: [
    {
      selector: ":root",
      why: "base.css holds the app-wide layout tokens; a component-local token belongs next to the rule that reads it.",
    },
  ],
  splitOwnership: [
    {
      selector: ".homepage, .terminliste, .res-side, .content-page",
      why: "The four page shells. They serve different routes by design, and the general layer is where they belong.",
    },
    {
      selector: ".rank-rad--ugyldig, .rank-table tbody tr.rank-rad--ugyldig td",
      why: "Not two owners: the second part only raises specificity so the page's own rule beats the table's cell styling.",
    },
  ],
};

// ── CSS parsing ──────────────────────────────────────────────────────────────
/** Splits a stylesheet into top-level blocks, keeping each @media whole. */
function parseBlocks(text) {
  const blocks = [];
  let depth = 0;
  let start = 0;
  let inComment = false;
  for (let i = 0; i < text.length; i++) {
    if (!inComment && text.startsWith("/*", i)) inComment = true;
    else if (inComment && text.startsWith("*/", i)) inComment = false;
    if (inComment) continue;
    if (text[i] === "{") depth++;
    else if (text[i] === "}" && --depth === 0) {
      blocks.push(text.slice(start, i + 1));
      start = i + 1;
    }
  }
  return blocks;
}

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ");

function selectorOf(block) {
  const s = stripComments(block).trim();
  const brace = s.indexOf("{");
  return (brace === -1 ? s : s.slice(0, brace)).trim().replace(/\s+/g, " ");
}

/** Class names a block's selectors mention, at any nesting depth. */
function classesOf(block) {
  const selectors = stripComments(block).replace(/\{[^{}]*\}/g, "{}");
  return [...new Set([...selectors.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]))];
}

/**
 * Every property a block declares, with its value. An @media block is keyed by
 * its condition, so a mobile override is never mistaken for cancelling a
 * desktop one. Custom properties are skipped: nothing reads them positionally.
 */
function declarationsOf(block) {
  const text = stripComments(block);
  const atRule = text.match(/^\s*@[\w-]+[^{]*/);
  const scope = atRule ? atRule[0].trim().replace(/\s+/g, " ") : "";
  const out = [];
  for (const m of text.matchAll(/([-a-zA-Z][\w-]*)\s*:\s*([^;{}]+)[;}]/g)) {
    const prop = m[1].trim();
    if (prop.startsWith("--")) continue;
    out.push([scope ? `${scope}|${prop}` : prop, m[2].trim().replace(/\s+/g, " ")]);
  }
  return out;
}

// ── Inputs ───────────────────────────────────────────────────────────────────
const stylesFile = join(srcRoot, "styles.css");
const importOrder = [
  ...readFileSync(stylesFile, "utf8").matchAll(/@import\s+"\.\/css\/([^"]+)"/g),
].map((m) => m[1]);

function walk(dir, test, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, test, out);
    else if (test(name)) out.push(p);
  }
  return out;
}

const filesOnDisk = walk(cssRoot, (n) => n.endsWith(".css"))
  .map((p) => relative(cssRoot, p).split(sep).join("/"))
  .sort();

// What renders the markup: every module plus the static shell.
const consumerSource = [
  ...walk(srcRoot, (n) => n.endsWith(".ts") && !n.endsWith(".d.ts")).filter(
    (p) => !p.includes(`${sep}css${sep}`),
  ),
  join(srcRoot, "index.html"),
]
  .map((p) => readFileSync(p, "utf8"))
  .join("\n");

const bootstrapCss = join(repoRoot, "node_modules", "bootstrap", "dist", "css", "bootstrap.css");
if (!existsSync(bootstrapCss)) {
  console.error(`Cannot read ${bootstrapCss} — install dependencies first.`);
  process.exit(1);
}
// Bootstrap owns these names, so a rule using one is never ours to call dead.
const bootstrapClasses = new Set(
  [...readFileSync(bootstrapCss, "utf8").matchAll(/^\.([\w-]+)/gm)].map((m) => m[1]),
);

const ownClassesOf = (block) => classesOf(block).filter((c) => !bootstrapClasses.has(c));

/**
 * Whether anything renders this class. Paranoid about names assembled at
 * runtime: `admin-badge--ok` may only ever appear as `admin-badge--${tone}`, so
 * a literal prefix followed by an interpolation counts as a use.
 */
function isRendered(cls) {
  const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`).test(consumerSource)) return true;
  for (const cut of [cls.lastIndexOf("--"), cls.lastIndexOf("-")]) {
    if (cut <= 0) continue;
    const stem = cls.slice(0, cut + (cls.slice(cut, cut + 2) === "--" ? 2 : 1));
    if (
      consumerSource.includes(`${stem}\${`) ||
      consumerSource.includes(`${stem}" +`) ||
      consumerSource.includes(`${stem}' +`)
    ) {
      return true;
    }
  }
  return false;
}

/** The module that owns a selector, judged by its rarest class. */
const consumerCache = new Map();
function consumersOf(cls) {
  if (!consumerCache.has(cls)) {
    const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`);
    const hits = [];
    for (const p of walk(srcRoot, (n) => n.endsWith(".ts") && !n.endsWith(".d.ts")).filter(
      (f) => !f.includes(`${sep}css${sep}`),
    )) {
      if (re.test(readFileSync(p, "utf8"))) hits.push(relative(srcRoot, p).split(sep).join("/"));
    }
    if (re.test(readFileSync(join(srcRoot, "index.html"), "utf8"))) hits.push("index.html");
    consumerCache.set(cls, hits);
  }
  return consumerCache.get(cls);
}

function ownerOf(selectorPart) {
  const classes = [
    ...new Set([...selectorPart.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1])),
  ].filter((c) => !bootstrapClasses.has(c));
  return classes
    .map((c) => ({ cls: c, users: consumersOf(c) }))
    .filter((x) => x.users.length)
    .sort((a, b) => a.users.length - b.users.length)[0];
}

// ── Cascade snapshot ─────────────────────────────────────────────────────────
/**
 * For every (class, property) pair, the ordered run of declared values. Two
 * trees with identical runs render identically however the files are arranged.
 * global.css comes first because index.html links it before styles.css.
 */
function cascadeSnapshot() {
  const sources = [readFileSync(join(srcRoot, "global.css"), "utf8")];
  const styles = readFileSync(stylesFile, "utf8");
  // Before the css/ split, styles.css was the stylesheet rather than an index.
  sources.push(
    ...(importOrder.length
      ? importOrder.map((rel) => readFileSync(join(cssRoot, rel), "utf8"))
      : [styles]),
  );

  const seq = new Map();
  let blocks = 0;
  for (const text of sources) {
    for (const block of parseBlocks(text)) {
      if (!stripComments(block).trim()) continue;
      blocks++;
      // Rules sharing only a Bootstrap class can never hit the same element, so
      // key on our own names; fall back to all of them when there are none.
      const all = classesOf(block);
      const own = all.filter((c) => !bootstrapClasses.has(c));
      const keys = own.length ? own : all;
      for (const [prop, value] of declarationsOf(block)) {
        for (const cls of keys) {
          const k = `${cls} ${prop}`;
          if (!seq.has(k)) seq.set(k, []);
          seq.get(k).push(value);
        }
      }
    }
  }
  return { blocks, seq: Object.fromEntries(seq) };
}

// ── Checks ───────────────────────────────────────────────────────────────────
const errors = [];
const warnings = [];

function checkImports() {
  const missing = importOrder.filter((f) => !existsSync(join(cssRoot, f)));
  const orphaned = filesOnDisk.filter((f) => !importOrder.includes(f));
  const doubled = importOrder.filter((f, i) => importOrder.indexOf(f) !== i);
  const empty = filesOnDisk.filter(
    (f) => stripComments(readFileSync(join(cssRoot, f), "utf8")).trim() === "",
  );
  const headerless = filesOnDisk.filter(
    (f) => !readFileSync(join(cssRoot, f), "utf8").startsWith("/*"),
  );

  for (const { label, list } of [
    { label: "imported but missing on disk", list: missing },
    { label: "on disk but never imported", list: orphaned },
    { label: "imported more than once", list: doubled },
    { label: "contains no rules", list: empty },
    { label: "has no header saying who renders it", list: headerless },
  ]) {
    if (list.length) errors.push(`${list.length} file(s) ${label}: ${list.join(", ")}`);
  }
  return `${filesOnDisk.length} files, ${importOrder.length} imports`;
}

function checkDeadRules() {
  const dead = [];
  for (const rel of importOrder) {
    for (const block of parseBlocks(readFileSync(join(cssRoot, rel), "utf8"))) {
      const own = ownClassesOf(block);
      // A rule is dead only when every class it names is unrendered.
      if (own.length && own.every((c) => !isRendered(c)))
        dead.push(`${rel}: ${selectorOf(block).slice(0, 60)}`);
    }
  }
  if (dead.length)
    errors.push(`${dead.length} rule(s) nothing renders:\n    ` + dead.join("\n    "));
  return dead.length ? `${dead.length} dead` : "none";
}

function checkDeadVars() {
  const css =
    importOrder.map((rel) => readFileSync(join(cssRoot, rel), "utf8")).join("\n") +
    readFileSync(join(srcRoot, "global.css"), "utf8");
  const declared = new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));
  const read = new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
  // --bs-* belong to Bootstrap: we set them, its own stylesheet reads them.
  const unused = [...declared].filter(
    (v) => !v.startsWith("--bs-") && !read.has(v) && !consumerSource.includes(v),
  );
  if (unused.length)
    errors.push(`${unused.length} custom propert(ies) nothing reads: ${unused.join(", ")}`);
  return unused.length ? `${unused.length} unused` : "none";
}

const allowed = (list, selector) => list.some((a) => selector.startsWith(a.selector));

function checkDuplicateSelectors() {
  const seen = new Map();
  for (const rel of importOrder) {
    for (const block of parseBlocks(readFileSync(join(cssRoot, rel), "utf8"))) {
      const sel = selectorOf(block);
      if (!sel || sel.startsWith("@")) continue;
      if (!seen.has(sel)) seen.set(sel, new Set());
      seen.get(sel).add(rel);
    }
  }
  let n = 0;
  for (const [sel, files] of seen) {
    if (files.size < 2 || allowed(ALLOW.duplicateSelectors, sel)) continue;
    n++;
    warnings.push(`"${sel.slice(0, 60)}" is declared in ${[...files].join(" and ")}`);
  }
  return n ? `${n} unexpected` : "none beyond the allowed";
}

function checkSplitOwnership() {
  let n = 0;
  for (const rel of importOrder) {
    for (const block of parseBlocks(readFileSync(join(cssRoot, rel), "utf8"))) {
      const sel = selectorOf(block);
      if (!sel || sel.startsWith("@") || !sel.includes(",")) continue;
      if (allowed(ALLOW.splitOwnership, sel)) continue;

      const owners = sel
        .split(",")
        .map((part) => ownerOf(part.trim()))
        .filter(Boolean);
      if (owners.length < 2) continue;
      if (new Set(owners.map((o) => o.users.join("|"))).size < 2) continue;

      n++;
      warnings.push(
        `${rel}: "${sel.slice(0, 56)}" groups selectors owned by different modules —\n      ` +
          owners.map((o) => `.${o.cls} ← ${o.users.join(", ")}`).join("\n      "),
      );
    }
  }
  return n ? `${n} unexpected` : "none beyond the allowed";
}

// ── Run ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
};

const snapshotTo = flag("--snapshot");
const against = flag("--against");

if (snapshotTo) {
  const snap = cascadeSnapshot();
  writeFileSync(snapshotTo, JSON.stringify(snap));
  console.log(
    `Wrote ${snapshotTo} — ${snap.blocks} blocks, ${Object.keys(snap.seq).length} class/property pairs.`,
  );
  process.exit(0);
}

if (against) {
  if (!existsSync(against)) {
    console.error(`No such snapshot: ${against}`);
    process.exit(1);
  }
  const renamesFile = flag("--renames");
  const renames = renamesFile ? JSON.parse(readFileSync(renamesFile, "utf8")) : {};
  // Longest first, so `a--b` is not half-renamed by a rule for `a`.
  const renamePairs = Object.entries(renames).sort((a, b) => b[0].length - a[0].length);
  const applyRenames = (s) =>
    renamePairs.reduce(
      (acc, [from, to]) => acc.replace(new RegExp(`(?<![\\w-])${from}(?![\\w-])`, "g"), to),
      s,
    );

  const before = JSON.parse(readFileSync(against, "utf8"));
  const after = cascadeSnapshot();
  const beforeSeq = new Map();
  for (const [k, values] of Object.entries(before.seq))
    beforeSeq.set(
      applyRenames(k),
      values.map((v) => applyRenames(v)),
    );

  const diffs = [];
  for (const k of new Set([...beforeSeq.keys(), ...Object.keys(after.seq)])) {
    const a = (beforeSeq.get(k) ?? []).join(" → ");
    const b = (after.seq[k] ?? []).join(" → ");
    if (a === b) continue;
    const [cls, prop] = k.split(" ");
    diffs.push(`.${cls} { ${prop} }\n      before [${a}]\n      after  [${b}]`);
  }

  console.log(`Cascade: ${before.blocks} blocks before, ${after.blocks} after.`);
  if (!diffs.length) {
    console.log("Equivalent — every class keeps the same run of values for every property.");
    process.exit(0);
  }
  console.log(
    `\n${diffs.length} difference(s) — each one can change how the page looks, so justify or fix it:`,
  );
  for (const d of diffs.slice(0, 40)) console.log("  " + d);
  if (diffs.length > 40) console.log(`  … and ${diffs.length - 40} more`);
  process.exit(1);
}

const results = [
  ["imports", checkImports()],
  ["dead rules", checkDeadRules()],
  ["dead custom properties", checkDeadVars()],
  ["duplicate selectors", checkDuplicateSelectors()],
  ["split ownership", checkSplitOwnership()],
];
for (const [name, summary] of results) console.log(`${name.padEnd(24)} ${summary}`);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s) — a human call, not a failure:`);
  for (const w of warnings) console.log("  " + w);
}
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log("  " + e);
  process.exit(1);
}
console.log("\nsrc/css is consistent.");
