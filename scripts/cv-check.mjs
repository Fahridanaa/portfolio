// Guards the CV against the three defects that shipped before: a contact line
// that collided with the name, section text that sat on the rule, and body gaps
// that came out tighter than the heading above them, so the page read as one
// dense block. All three came from spacing that collapsed, which no type checker
// can see.
//
// It also checks each lane's resolved document against the PDF text: the first
// job must read employer, role, bullets; the date must stay on the role row;
// and every skill row in the document must be on the page. Needs poppler-utils
// on PATH; skips cleanly without it.
//
//   node scripts/cv-check.mjs <pdf> --doc cv/.build/<lane>.json

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const docFlag = args.indexOf("--doc");
const docPath = docFlag === -1 ? null : args[docFlag + 1];
const pdf =
  args.find(
    (arg, index) => !arg.startsWith("--") && index !== docFlag + 1,
  ) ?? "public/assets/cv.pdf";
if (!docPath) {
  console.error("usage: node scripts/cv-check.mjs <pdf> --doc <resolved.json>");
  process.exit(2);
}
const doc = JSON.parse(readFileSync(docPath, "utf8"));

const HEADINGS = ["SUMMARY", "EXPERIENCE", "EDUCATION", "PROJECTS", "SKILLS"];
const REQUIRED_SKILLS = ["Languages", "Backend", "Infrastructure", "Testing"];
const MIN_HEADER_GAP = 5;
const MIN_HEADING_GAP = 6;
const MIN_BULLET_GAP = 3.5;
const MIN_LIST_GAP = 6;
// A heading must sit closer to the text under it than to the section above it,
// or the eye reads it as belonging to neither.
const MIN_HEADING_PULL = 3;

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

const info = execFileSync("pdfinfo", [pdf], { encoding: "utf8" });
const pages = Number(info.match(/^Pages:\s+(\d+)/m)[1]);
const title = info.match(/^Title:\s+(.*)$/m)?.[1]?.trim() ?? "";

// pdftotext -bbox emits XML, so an ampersand arrives as &amp;. Decode it before
// matching probe text, or a company like 80&Company is invisible to the checks.
const decodeXml = (text) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCodePoint(Number.parseInt(n, 16)),
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
  text: decodeXml(m[4]),
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
if (title !== doc.meta.title) {
  fail(`PDF title is "${title}", want "${doc.meta.title}"`);
}

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
  const categories = doc.skills.map((skill) => skill.category);
  for (const required of REQUIRED_SKILLS) {
    if (!categories.includes(required)) {
      fail(`required skill row ${required}: not in the document`);
    }
  }
  for (const category of categories) {
    const row = `${category}:`;
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
const sample = doc.experience?.[0];
if (!sample) {
  fail("document has no first experience entry");
} else {
  const orgProbe = sample.company.split(/\s+/).slice(0, 3).join(" ");
  const roleProbe = sample.role.split(/\s+/).slice(0, 3).join(" ");
  const pointProbe = sample.points[0].split(/\s+/).slice(0, 5).join(" ");
  const experienceAt = headingLine("EXPERIENCE");
  const experienceLines = lines.slice(experienceAt + 1);
  const experienceText = experienceLines.map((l) => l.text).join(" ");
  const orgAt = experienceText.indexOf(orgProbe);
  const roleAt = experienceText.indexOf(roleProbe);
  const pointAt = experienceText.indexOf(pointProbe);
  if (orgAt === -1 || roleAt === -1 || pointAt === -1) {
    fail(
      `experience probes not found in the text layer (org "${orgProbe}", role "${roleProbe}", point "${pointProbe}")`,
    );
  } else if (!(orgAt < roleAt && roleAt < pointAt)) {
    fail(
      "experience entry reads out of order, want employer, role, then bullets",
    );
  }

  const orgLine = experienceLines.findIndex((l) => l.text.includes(orgProbe));
  const roleLine = experienceLines.findIndex(
    (l, i) => i > orgLine && l.text.includes(roleProbe),
  );
  if (orgLine === -1 || roleLine === -1) {
    fail("employer row or role row not found");
  } else {
    const dateProbe = sample.date.split(/\s+/)[0];
    const roleWord = experienceLines[roleLine].words.find(
      (w) => w.text === sample.role.split(/\s+/)[0],
    );
    const dateWord = experienceLines[roleLine].words.find(
      (w) => w.text === dateProbe,
    );
    if (!dateWord) {
      fail(`date ${dateProbe} is not on the role row`);
    } else if (
      roleWord &&
      Math.abs(roleWord.top - dateWord.top) > 2
    ) {
      fail(
        `date sits ${Math.abs(roleWord.top - dateWord.top).toFixed(1)}pt off the role row`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(`cv-check failed for ${doc.meta.label}:`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

console.log(
  `cv-check: ${pages} page ${doc.meta.label}, header gap, heading pull, skill rows, bullet gaps and entry order hold`,
);
