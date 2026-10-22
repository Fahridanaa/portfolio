// Build one experimental CV lane from a patch file, without touching the facts.
//
//   node scripts/cv-variant.mjs backend-new
//
// cv/resume.json stays the source of truth. A patch in cv/variants/<name>.json
// may replace the summary, reword named points, drop a point from the lane,
// add or remove whole entries, add an existing fact to a selection, reorder
// projects, rewrite skill rows, and override the header location or an entry's
// date. The resolver then builds cv/.build/<name>.json and typst renders it to
// cv/.build/<name>.pdf, which is git-ignored like every other build artifact.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { resolveLane } from "./cv-lanes.mjs";

const ROOT = process.cwd();
const name = process.argv[2];
if (!name) {
  console.error("usage: node scripts/cv-variant.mjs <name>");
  process.exit(2);
}

const patchPath = path.join(ROOT, "cv/variants", `${name}.json`);
const patch = JSON.parse(readFileSync(patchPath, "utf8"));
const source = JSON.parse(readFileSync(path.join(ROOT, "cv/resume.json"), "utf8"));

const entries = new Map(
  [...(source.experience ?? []), ...(source.projects ?? [])].map((entry) => [
    entry.id,
    entry,
  ]),
);

// Reword named points in the fact base copy.
for (const [key, text] of Object.entries(patch.points ?? {})) {
  const [id, pointId] = key.split(".");
  const entry = entries.get(id);
  if (!entry) throw new Error(`${name}: unknown entry "${id}"`);
  if (entry.points?.[pointId] === undefined) {
    throw new Error(`${name}: ${id} has no point "${pointId}"`);
  }
  entry.points[pointId] = text;
}

if (patch.location) source.basics.location = patch.location;
for (const [id, date] of Object.entries(patch.dates ?? {})) {
  const entry = entries.get(id);
  if (!entry) throw new Error(`${name}: unknown entry "${id}"`);
  entry.date = date;
}

const base = source.lanes[patch.basedOn ?? "backend"];
if (!base) throw new Error(`${name}: unknown base lane "${patch.basedOn}"`);

const lane = structuredClone(base);
if (patch.summary) lane.summary = patch.summary;

// Add a whole entry to this lane. The entry itself comes from the fact base,
// so a variant never invents a project that resume.json does not hold.
for (const [kind, list] of Object.entries(patch.include ?? {})) {
  const target = lane[kind] ?? (lane[kind] = []);
  for (const item of list) {
    const entry = entries.get(item.id);
    if (!entry) throw new Error(`${name}: unknown entry "${item.id}"`);
    if (target.some((sel) => sel.id === item.id)) {
      throw new Error(`${name}: ${kind} already has "${item.id}"`);
    }
    const points = item.points ?? [];
    for (const pointId of points) {
      if (entry.points?.[pointId] === undefined) {
        throw new Error(`${name}: ${item.id} has no point "${pointId}"`);
      }
    }
    const at = item.at ?? target.length;
    if (at < 0 || at > target.length) {
      throw new Error(`${name}: ${kind} insert index ${at} is out of range`);
    }
    const sel = { id: item.id, points };
    if (item.role) sel.role = item.role;
    target.splice(at, 0, sel);
  }
}

// Remove a whole entry from this lane only. The entry stays in the fact base.
for (const [kind, ids] of Object.entries(patch.remove ?? {})) {
  const target = lane[kind] ?? [];
  for (const id of ids) {
    const at = target.findIndex((sel) => sel.id === id);
    if (at === -1) throw new Error(`${name}: ${kind} has no "${id}"`);
    target.splice(at, 1);
    if (target.length === 0) {
      throw new Error(`${name}: remove emptied the ${kind} list`);
    }
  }
}

// Rewrite a skills row for this lane only.
for (const [category, items] of Object.entries(patch.skills ?? {})) {
  const row = source.skills[lane.skills]?.find(
    (candidate) => candidate.category === category,
  );
  if (!row) throw new Error(`${name}: this lane has no "${category}" skill row`);
  row.items = items;
}

// Add a point to this lane only. Its text joins the fact base, and the lane
// receives it at the named position so the entry reads in a chosen order.
for (const [id, list] of Object.entries(patch.addPoints ?? {})) {
  const entry = entries.get(id);
  if (!entry) throw new Error(`${name}: unknown entry "${id}"`);
  for (const point of list) {
    if (entry.points?.[point.id] !== undefined) {
      throw new Error(`${name}: ${id} already has point "${point.id}"`);
    }
    entry.points[point.id] = point.text;
    const sel = [...(lane.experience ?? []), ...(lane.projects ?? [])].find(
      (candidate) => candidate.id === id,
    );
    if (!sel) throw new Error(`${name}: ${id} is not selected in this lane`);
    const after = point.after ? sel.points.indexOf(point.after) : -1;
    if (point.after && after === -1) {
      throw new Error(`${name}: ${id} has no selected point "${point.after}"`);
    }
    sel.points.splice(after === -1 ? sel.points.length : after + 1, 0, point.id);
  }
}

// Add an existing fact to a lane selection at a chosen position. Unlike
// addPoints, this does not touch the fact base.
for (const [id, list] of Object.entries(patch.select ?? {})) {
  const entry = entries.get(id);
  if (!entry) throw new Error(`${name}: unknown entry "${id}"`);
  const sel = [...(lane.experience ?? []), ...(lane.projects ?? [])].find(
    (candidate) => candidate.id === id,
  );
  if (!sel) throw new Error(`${name}: ${id} is not selected in this lane`);
  for (const item of list) {
    if (entry.points?.[item.point] === undefined) {
      throw new Error(`${name}: ${id} has no point "${item.point}"`);
    }
    if (sel.points.includes(item.point)) {
      throw new Error(`${name}: ${id} already selects "${item.point}"`);
    }
    const after = item.after ? sel.points.indexOf(item.after) : -1;
    if (item.after && after === -1) {
      throw new Error(`${name}: ${id} has no selected point "${item.after}"`);
    }
    sel.points.splice(after === -1 ? sel.points.length : after + 1, 0, item.point);
  }
}

// Drop selected points from this lane only. The fact stays in the entry.
const drop = new Set(patch.drop ?? []);
for (const kind of ["experience", "projects"]) {
  for (const sel of lane[kind] ?? []) {
    const kept = sel.points.filter((pointId) => !drop.has(`${sel.id}.${pointId}`));
    if (kept.length === 0) {
      throw new Error(`${name}: drop emptied ${sel.id}, remove the entry instead`);
    }
    sel.points = kept;
  }
}

// Reorder a lane section. The set must stay identical.
for (const [kind, ids] of Object.entries(patch.order ?? {})) {
  const selected = lane[kind] ?? [];
  const current = selected.map((sel) => sel.id);
  const sameSet =
    current.length === ids.length && ids.every((id) => current.includes(id));
  if (!sameSet) {
    throw new Error(
      `${name}: ${kind} order must name the same ${current.length} entries, got ${ids.join(", ")}`,
    );
  }
  lane[kind] = ids.map((id) => selected.find((sel) => sel.id === id));
}

source.lanes[name] = lane;
const doc = resolveLane(source, name);

const build = path.join(ROOT, "cv/.build");
mkdirSync(build, { recursive: true });
const docPath = path.join(build, `${name}.json`);
writeFileSync(docPath, `${JSON.stringify(doc, null, 2)}\n`);

const pdf = path.join(build, `${name}.pdf`);
execFileSync(
  "typst",
  ["compile", "--input", `lane=${name}`, path.join(ROOT, "cv/main.typ"), pdf],
  { stdio: "inherit" },
);
execFileSync(
  process.execPath,
  [path.join(ROOT, "scripts/cv-check.mjs"), pdf, "--doc", docPath],
  { stdio: "inherit" },
);
console.log(`cv:variant: ${path.relative(ROOT, pdf)}`);
