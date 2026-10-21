// Guards the CV against the three defects that shipped before: a contact line
// that collided with the name, section text that sat on the rule, and body gaps
// that came out tighter than the heading above them, so the page read as one
// dense block. All three came from spacing that collapsed, which no type checker
// can see. Needs poppler-utils on PATH; skips cleanly without it.

import { execFileSync } from "node:child_process";

const pdf = process.argv[2] ?? "public/assets/cv.pdf";
const HEADINGS = ["SUMMARY", "EXPERIENCE", "EDUCATION", "PROJECTS", "SKILLS"];
const MIN_HEADER_GAP = 5;
const MIN_HEADING_GAP = 6;
const MIN_BULLET_GAP = 3.5;
const MIN_LIST_GAP = 6;
// A heading must sit closer to the text under it than to the section above it,
// or the eye reads it as belonging to neither.
const MIN_HEADING_PULL = 3;
// The skills block is four flat lines. At a line gap this small they merge into
// one paragraph, which is how the section looked before.
const SKILLS_ROWS = ["Languages:", "Backend:", "Infrastructure:", "Testing:"];

function has(cmd) {
  try {
    execFileSync("sh", ["-c", `command -v ${cmd}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (!has("pdfinfo") || !has("pdftotext")) {
  console.log("cv-check: poppler-utils not found, skipping");
  process.exit(0);
}

const pages = Number(
  execFileSync("pdfinfo", [pdf], { encoding: "utf8" }).match(
    /^Pages:\s+(\d+)/m,
  )[1],
);

const words = [
  ...execFileSync("pdftotext", ["-bbox", pdf, "-"], {
    encoding: "utf8",
  }).matchAll(
    /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="[\d.]+" yMax="([\d.]+)">([^<]*)<\/word>/g,
  ),
].map((m) => ({
  x: Number(m[1]),
  top: Number(m[2]),
  bottom: Number(m[3]),
  text: m[4],
}));

// Spacing lives between lines, not between words, so every rhythm check below
// works on baseline groups.
const lines = [];
for (const w of [...words].sort((a, b) => a.top - b.top)) {
  const last = lines.at(-1);
  if (last && Math.abs(last.top - w.top) <= 1.5) {
    last.bottom = Math.max(last.bottom, w.bottom);
    last.words.push(w);
  } else {
    lines.push({ top: w.top, bottom: w.bottom, words: [w] });
  }
}
// The text layer does not promise reading order across runs, so a line is read
// by x.
for (const line of lines) {
  line.words.sort((a, b) => a.x - b.x);
  line.text = line.words.map((w) => w.text).join(" ");
}
const gapAbove = (i) => lines[i].top - lines[i - 1].bottom;
const headingLine = (name) => lines.findIndex((l) => l.text.startsWith(name));

const failures = [];
const fail = (msg) => failures.push(msg);

if (pages !== 1) fail(`expected 1 page, got ${pages}`);

const name = words.find((w) => w.text === "Fahridana");
const contact = words.find((w) => w.text === "Indonesia");
if (!name || !contact) {
  fail("header words not found in the text layer");
} else {
  const gap = contact.top - name.bottom;
  if (gap < MIN_HEADER_GAP) {
    fail(
      `name to contact gap is ${gap.toFixed(2)}pt, want ${MIN_HEADER_GAP}pt or more`,
    );
  }
}

for (const heading of HEADINGS) {
  const i = headingLine(heading);
  if (i === -1) {
    fail(`heading ${heading} not found`);
    continue;
  }
  const below = gapAbove(i + 1);
  if (below < MIN_HEADING_GAP) {
    fail(
      `${heading} to body gap is ${below.toFixed(2)}pt, want ${MIN_HEADING_GAP}pt or more`,
    );
  }
  if (i > 0) {
    const above = gapAbove(i);
    if (above - below < MIN_HEADING_PULL) {
      fail(
        `${heading} sits ${above.toFixed(2)}pt under the section before and ${below.toFixed(2)}pt over its body, want ${MIN_HEADING_PULL}pt more above than below`,
      );
    }
  }
}

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].text.startsWith("•")) continue;
  const gap = gapAbove(i);
  if (gap < MIN_BULLET_GAP) {
    fail(`bullet gap is ${gap.toFixed(2)}pt, want ${MIN_BULLET_GAP}pt or more`);
  }
}

const skillsAt = headingLine("SKILLS");
if (skillsAt === -1) {
  fail("skills block not found");
} else {
  for (const row of SKILLS_ROWS) {
    const i = lines.findIndex((l) => l.text.startsWith(row));
    if (i === -1) {
      fail(`skill row ${row} not found`);
      continue;
    }
    const gap = gapAbove(i);
    if (gap < MIN_LIST_GAP) {
      fail(
        `skill row gap at ${row} is ${gap.toFixed(2)}pt, want ${MIN_LIST_GAP}pt or more`,
      );
    }
  }
}

// An entry is two rows: employer with the location, then role with the date.
// A date that drifts off the role row lands on its own line in the text layer,
// where a parser reads it as a stray date.
const order = words.map((w) => w.text).join(" ");
const org = order.indexOf("Multi Spunindo");
const role = order.indexOf("Management Information System Intern");
const firstPoint = order.indexOf("Rewrote the Performance Appraisal");
if (org === -1 || role === -1 || firstPoint === -1) {
  fail("experience entry words not found in the text layer");
} else if (!(org < role && role < firstPoint)) {
  fail(
    "experience entry reads out of order, want employer, role, then bullets",
  );
}

const roleWord = words.find((w) => w.text === "Management");
const dateWord = words.find((w) => w.text === "Jul");
if (!roleWord || !dateWord) {
  fail("role row or date row missing");
} else {
  const drift = Math.abs(roleWord.top - dateWord.top);
  if (drift > 2) fail(`date sits ${drift.toFixed(1)}pt off the role row`);
}

if (failures.length > 0) {
  console.error("cv-check failed:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

console.log(
  `cv-check: ${pages} page, header gap, heading pull, skill rows, bullet gaps and entry order hold`,
);
