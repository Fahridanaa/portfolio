#!/usr/bin/env node
// Wraps the BB browser session so a recipe never handles volatile ids.
// open | run [--label name] | shot <label> | close
// `run` reads its DevBrowser script from stdin.
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../../../..");
const STATE = path.join(ROOT, ".verify");
const SESSION_FILE = path.join(STATE, "session.json");
const PROOFS = path.join(STATE, "proofs");
const BACKEND = process.env.VERIFY_BACKEND ?? "desktop";
const TIMEOUT = "90s";

function fail(message) {
  console.error(message);
  process.exit(1);
}

// Returns the parsed body and never exits, so a dead session can be retried.
function call(args) {
  const result = spawnSync("bb", args, { encoding: "utf8" });
  if (result.error) return { body: null, error: `bb is not runnable: ${result.error.message}` };
  let body = null;
  try {
    body = JSON.parse(result.stdout);
  } catch {}
  const error =
    body?.ok === false ? body.error?.message ?? "unknown error" : result.status === 0 ? null : result.stderr.trim();
  return { body, error, code: body?.error?.code };
}

function bb(args) {
  const { body, error } = call(args);
  if (error) fail(`bb ${args[0]} failed: ${error}`);
  return body;
}

function hostId() {
  if (process.env.BB_HOST_ID) return process.env.BB_HOST_ID;
  const id = bb(["status", "--json"])?.thread?.environment?.hostId;
  if (!id) fail("cannot resolve the host: run inside a BB thread or set BB_HOST_ID");
  return id;
}

function readSession() {
  if (!existsSync(SESSION_FILE)) return null;
  try {
    return JSON.parse(readFileSync(SESSION_FILE, "utf8")).id ?? null;
  } catch {
    return null;
  }
}

function liveSession() {
  const id = readSession();
  if (!id) return null;
  return call(["browser-automation", "preview", id, "--json"]).error ? null : id;
}

function open() {
  const live = liveSession();
  if (live) {
    console.error(`session ${live} is live`);
    return live;
  }
  const machine = hostId();
  const args = ["browser-automation", "open", "--backend", BACKEND, "--machine", machine];
  if (BACKEND === "desktop") {
    const instance =
      process.env.VERIFY_DESKTOP ??
      bb(["browser", "instances", "--host", machine, "--json"])?.instances?.[0]?.instanceId;
    if (!instance) fail("no desktop browser instance on this host; set VERIFY_BACKEND=local");
    args.push("--desktop", instance);
  } else {
    args.push("--headless");
  }
  const session = bb([...args, "--json"]);
  mkdirSync(STATE, { recursive: true });
  writeFileSync(SESSION_FILE, `${JSON.stringify({ id: session.id }, null, 2)}\n`);
  console.error(`session ${session.id} opened on ${BACKEND}`);
  return session.id;
}

// A session dies after five idle minutes. Reopen once and rerun the same step.
function withSession(run) {
  const id = liveSession() ?? open();
  const first = run(id);
  if (!first.error) return first.body;
  if (first.code !== "session_unavailable" && !/Session stopped or expired/i.test(first.error)) {
    fail(`browser step failed: ${first.error}`);
  }
  rmSync(SESSION_FILE, { force: true });
  const retry = run(open());
  if (retry.error) fail(`browser step failed after reopen: ${retry.error}`);
  return retry.body;
}

function slug(value) {
  return (
    (value ?? "capture")
      .replace(/[^a-z0-9-]+/gi, "-")
      .replace(/^-|-$/g, "") || "capture"
  );
}

function saveImages(body, label) {
  const images = body?.images ?? [];
  if (!images.length) return;
  mkdirSync(PROOFS, { recursive: true });
  images.forEach((image, index) => {
    const suffix = images.length > 1 ? `-${index + 1}` : "";
    const target = path.join(PROOFS, `${slug(label)}${suffix}.jpg`);
    copyFileSync(image.path, target);
    console.error(`proof ${target}`);
  });
}

function run(label) {
  const script = readFileSync(0, "utf8").trim();
  if (!script) fail("usage: node drive.mjs run [--label name] <<'JS' ... JS");
  const body = withSession((id) =>
    call(["browser-automation", "run", id, "--script", script, "--timeout", TIMEOUT, "--json"]),
  );
  if (body.text) console.log(body.text);
  saveImages(body, label);
}

function shot(label) {
  const body = withSession((id) =>
    call(["browser-automation", "screenshot", id, "--page", "main", "--json"]),
  );
  saveImages(body, label);
}

function close() {
  const id = readSession();
  if (!id) {
    console.error("no session file");
    return;
  }
  const { error } = call(["browser-automation", "close", id, "--json"]);
  rmSync(SESSION_FILE, { force: true });
  console.error(error ? `session ${id} was already gone` : `session ${id} closed`);
}

const [command, argument] = process.argv.slice(2);
const flagIndex = process.argv.indexOf("--label");
const labelArg = flagIndex > -1 ? process.argv[flagIndex + 1] : undefined;

if (command === "open") open();
else if (command === "run") run(labelArg ?? argument);
else if (command === "shot") {
  if (!argument) fail("usage: node drive.mjs shot <label>");
  shot(argument);
} else if (command === "close") close();
else {
  console.error("usage: node drive.mjs open | run [--label name] | shot <label> | close");
  process.exit(1);
}
