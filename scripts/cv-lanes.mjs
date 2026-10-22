// One source of truth for the CV facts, one view per lane.
//
// cv/resume.json holds every experience and project as an entry with named
// points. A lane is a selection and an order, never a copy: the same fact text
// feeds all three PDFs, so a correction cannot land in one lane and miss the
// others. This module turns a lane into the flat document cv/main.typ renders.

import { readFileSync } from "node:fs";
import path from "node:path";

export const LANE_IDS = ["backend", "frontend", "fullstack"];

export function readResume(root = process.cwd()) {
  return JSON.parse(readFileSync(path.join(root, "cv/resume.json"), "utf8"));
}

function indexById(entries, kind) {
  const byId = new Map();
  for (const entry of entries) {
    if (!entry.id) throw new Error(`${kind} entry has no id: ${entry.name ?? entry.company ?? "?"}`);
    if (byId.has(entry.id)) throw new Error(`duplicate ${kind} id: ${entry.id}`);
    byId.set(entry.id, entry);
  }
  return byId;
}

function pickPoints(laneId, entry, pointIds) {
  if (!Array.isArray(pointIds) || pointIds.length === 0) {
    throw new Error(`${laneId}: ${entry.id} has no selected points`);
  }
  const seen = new Set();
  return pointIds.map((id) => {
    if (seen.has(id)) throw new Error(`${laneId}: ${entry.id}.${id} is listed twice`);
    seen.add(id);
    const text = entry.points?.[id];
    if (typeof text !== "string" || text.trim() === "") {
      throw new Error(`${laneId}: ${entry.id} has no point "${id}"`);
    }
    return text;
  });
}

function selectEntries(laneId, kind, selected, byId) {
  if (!Array.isArray(selected) || selected.length === 0) {
    throw new Error(`${laneId}: no ${kind} selected`);
  }
  return selected.map((sel) => {
    const entry = byId.get(sel.id);
    if (!entry) throw new Error(`${laneId}: unknown ${kind} "${sel.id}"`);
    const points = pickPoints(laneId, entry, sel.points);
    if (kind === "experience") {
      return {
        company: entry.company,
        location: entry.location,
        role: sel.role ?? entry.role,
        date: entry.date,
        points,
      };
    }
    return {
      name: entry.name,
      role: sel.role ?? entry.role,
      date: entry.date,
      points,
    };
  });
}

export function resolveLane(source, laneId) {
  const lane = source.lanes?.[laneId];
  if (!lane) throw new Error(`unknown lane: ${laneId}`);
  if (typeof lane.summary !== "string" || lane.summary.trim() === "") {
    throw new Error(`${laneId}: missing summary`);
  }

  const experienceById = indexById(source.experience ?? [], "experience");
  const projectsById = indexById(source.projects ?? [], "project");
  const skills = source.skills?.[lane.skills];
  if (!Array.isArray(skills) || skills.length === 0) {
    throw new Error(`${laneId}: unknown or empty skills block "${lane.skills}"`);
  }

  return {
    meta: {
      lane: laneId,
      label: lane.label,
      title: `${source.basics.name} — ${lane.label} CV`,
      keywords: lane.keywords ?? [],
    },
    basics: { ...source.basics, summary: lane.summary },
    experience: selectEntries(laneId, "experience", lane.experience, experienceById),
    education: source.education ?? [],
    projects: selectEntries(laneId, "project", lane.projects, projectsById),
    skills,
  };
}

export function resolveAll(source) {
  const configured = Object.keys(source.lanes ?? {});
  const missing = LANE_IDS.filter((id) => !configured.includes(id));
  const extra = configured.filter((id) => !LANE_IDS.includes(id));
  if (missing.length || extra.length) {
    throw new Error(
      `lane set must be ${LANE_IDS.join(", ")}; missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}`,
    );
  }
  return Object.fromEntries(LANE_IDS.map((id) => [id, resolveLane(source, id)]));
}
