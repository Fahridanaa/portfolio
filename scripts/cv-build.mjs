// Build every CV lane from the one fact base, then guard each PDF.
//
//   npm run cv:build                 # all three, into public/assets/
//   npm run cv:build -- --watch      # rebuild on cv/ changes
//   npm run cv:apply -- frontend     # one lane with the phone, into cv/
//
// The resolver writes cv/.build/<lane>.json, which main.typ reads. A lane is a
// selection of named points, so a text correction lands in all three at once.

import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, watch, writeFileSync } from "node:fs";
import path from "node:path";
import { LANE_IDS, readResume, resolveAll } from "./cv-lanes.mjs";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public/assets");
const BUILD = path.join(ROOT, "cv/.build");
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const watchMode = args.includes("--watch");
const laneArg = args.find((arg) => !arg.startsWith("-"));
const targets = apply ? [laneArg ?? "fullstack"] : LANE_IDS;

function build() {
  const docs = resolveAll(readResume(ROOT));
  mkdirSync(BUILD, { recursive: true });

  for (const lane of LANE_IDS) {
    writeFileSync(
      path.join(BUILD, `${lane}.json`),
      `${JSON.stringify(docs[lane], null, 2)}\n`,
    );
  }

  for (const lane of targets) {
    if (!docs[lane]) throw new Error(`unknown lane: ${lane}`);
    const out = apply
      ? path.join(ROOT, `cv/fahridana-rayyansyah-${lane}-cv.pdf`)
      : path.join(OUT, `cv-${lane}.pdf`);
    const phone = apply ? ["--input", "show_phone=true"] : [];
    execFileSync(
      "typst",
      [
        "compile",
        "--input",
        `lane=${lane}`,
        ...phone,
        path.join(ROOT, "cv/main.typ"),
        out,
      ],
      { stdio: "inherit" },
    );
    execFileSync(
      process.execPath,
      [
        path.join(ROOT, "scripts/cv-check.mjs"),
        out,
        "--doc",
        path.join(BUILD, `${lane}.json`),
      ],
      { stdio: "inherit" },
    );
    if (!apply && lane === "fullstack") {
      copyFileSync(out, path.join(OUT, "cv.pdf"));
    }
    console.log(`cv:build: ${path.relative(ROOT, out)}`);
  }
}

if (watchMode) {
  build();
  let timer;
  watch(path.join(ROOT, "cv"), { recursive: true }, (_event, file) => {
    if (!file || !/\.(json|typ)$/.test(file) || file.includes(".build")) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        build();
      } catch (error) {
        console.error(`cv:watch: ${error.message}`);
      }
    }, 150);
  });
  console.log("cv:watch: watching cv/ for changes");
} else {
  build();
}
