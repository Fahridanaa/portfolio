#!/usr/bin/env node
// Read-only check: is the instance on VERIFY_PORT worth driving?
// Usage: node doctor.mjs
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../../../..");
const PORT = process.env.VERIFY_PORT ?? "4400";
const BASE = `http://127.0.0.1:${PORT}`;
const ROUTES = [
  "/",
  "/projects",
  "/projects/hris",
  "/blog",
  "/blog/just-do-it",
  "/art",
  "/assets/cv.pdf",
  "/assets/cv-backend.pdf",
  "/assets/cv-frontend.pdf",
  "/assets/cv-fullstack.pdf",
  "/sitemap-index.xml",
];
const SOURCES = ["src", "public", "astro.config.mjs", "package.json"];
const TITLE = "Fahridana Ahmad Rayyansyah";

let failed = 0;
function report(ok, label, detail) {
  if (!ok) failed += 1;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${detail ? `  ${detail}` : ""}`);
}

function newestMtime(target) {
  const info = statSync(target);
  if (!info.isDirectory()) return info.mtimeMs;
  let newest = 0;
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    newest = Math.max(newest, newestMtime(path.join(target, entry.name)));
  }
  return newest;
}

function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex").slice(0, 12);
}

async function get(route) {
  try {
    const res = await fetch(`${BASE}${route}`, { signal: AbortSignal.timeout(5000) });
    return { status: res.status, body: Buffer.from(await res.arrayBuffer()) };
  } catch {
    return null;
  }
}

const home = await get("/");
report(Boolean(home), "server", home ? BASE : `${BASE} is not answering`);
if (!home) {
  console.log("fix: node .agents/skills/verify-portfolio/scripts/serve.mjs start");
  process.exit(1);
}

for (const route of ROUTES) {
  const res = route === "/" ? home : await get(route);
  report(res?.status === 200, `GET ${route}`, res ? String(res.status) : "no response");
}

const cvPage = await get("/cv");
report(cvPage?.status === 404, "GET /cv is gone", cvPage ? String(cvPage.status) : "no response");

const title = home.body.toString("utf8").match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
report(title === TITLE, "home title", JSON.stringify(title));

const index = path.join(ROOT, "dist", "index.html");
const built = existsSync(index) ? statSync(index).mtimeMs : 0;
const stale = SOURCES.filter((source) => newestMtime(path.join(ROOT, source)) > built);
report(built > 0 && stale.length === 0, "dist is current", stale.length ? `newer than dist: ${stale.join(", ")}` : "");
if (stale.length) console.log("fix: node .agents/skills/verify-portfolio/scripts/serve.mjs start");

for (const file of [
  "cv.pdf",
  "cv-backend.pdf",
  "cv-frontend.pdf",
  "cv-fullstack.pdf",
]) {
  const served = (await get(`/assets/${file}`))?.body ?? Buffer.alloc(0);
  const distPdf = existsSync(path.join(ROOT, "dist", "assets", file))
    ? readFileSync(path.join(ROOT, "dist", "assets", file))
    : Buffer.alloc(0);
  const sourcePdf = existsSync(path.join(ROOT, "public", "assets", file))
    ? readFileSync(path.join(ROOT, "public", "assets", file))
    : Buffer.alloc(0);
  report(
    served.length > 0 && digest(served) === digest(distPdf),
    `served ${file} is the built one`,
    digest(served),
  );
  report(
    distPdf.length > 0 && digest(distPdf) === digest(sourcePdf),
    `built ${file} is the source one`,
    digest(sourcePdf),
  );
}

console.log(failed ? `doctor: ${failed} check(s) failed` : "doctor: healthy, drivable");
process.exit(failed ? 1 : 0);
