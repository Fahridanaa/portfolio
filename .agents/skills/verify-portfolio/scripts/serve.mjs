#!/usr/bin/env node
// Serves the built site for verification and stops only the process it started.
// Usage: node serve.mjs start | stop | status
import { spawn, spawnSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../../../..");
const STATE = path.join(ROOT, ".verify");
const PID_FILE = path.join(STATE, "preview.pid");
const LOG_FILE = path.join(STATE, "preview.log");
const BUILD_LOG = path.join(STATE, "build.log");
const PORT = process.env.VERIFY_PORT ?? "4400";
const BASE = `http://127.0.0.1:${PORT}`;
const ASTRO = path.join(ROOT, "node_modules", ".bin", "astro");
const SOURCES = ["src", "public", "astro.config.mjs", "package.json"];

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

function distIsStale() {
  const index = path.join(ROOT, "dist", "index.html");
  if (!existsSync(index)) return true;
  const built = statSync(index).mtimeMs;
  return SOURCES.some((source) => newestMtime(path.join(ROOT, source)) > built);
}

async function responds() {
  try {
    const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

function runningPid() {
  if (!existsSync(PID_FILE)) return null;
  const pid = Number(readFileSync(PID_FILE, "utf8").trim());
  if (!Number.isInteger(pid) || pid <= 0) return null;
  try {
    process.kill(pid, 0);
    return pid;
  } catch {
    return null;
  }
}

function build() {
  mkdirSync(STATE, { recursive: true });
  const log = openSync(BUILD_LOG, "w");
  const result = spawnSync("npm", ["run", "build"], {
    cwd: ROOT,
    stdio: ["ignore", log, log],
  });
  closeSync(log);
  if (result.status !== 0) {
    console.error(`build failed with exit ${result.status}: ${BUILD_LOG}`);
    process.exit(1);
  }
}

async function start() {
  const pid = runningPid();
  if (pid && (await responds())) {
    console.log(`already serving ${BASE} (pid ${pid})`);
    return;
  }
  if (!pid && (await responds())) {
    console.error(`${BASE} answers, but no pid file at ${PID_FILE}`);
    console.error("stop that server or set VERIFY_PORT to a free port");
    process.exit(1);
  }
  if (!existsSync(ASTRO)) {
    console.error(`missing ${ASTRO}; run npm install first`);
    process.exit(1);
  }
  if (distIsStale()) {
    console.log("dist is stale, building");
    build();
  }
  mkdirSync(STATE, { recursive: true });
  const log = openSync(LOG_FILE, "w");
  const child = spawn(ASTRO, ["preview", "--port", PORT, "--host", "127.0.0.1"], {
    cwd: ROOT,
    detached: true,
    stdio: ["ignore", log, log],
  });
  child.unref();
  closeSync(log);
  writeFileSync(PID_FILE, `${child.pid}\n`);

  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await responds()) {
      console.log(`serving ${BASE} (pid ${child.pid}, log ${LOG_FILE})`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  console.error(`no response from ${BASE} after 30s: ${LOG_FILE}`);
  try {
    process.kill(child.pid, "SIGTERM");
  } catch {}
  rmSync(PID_FILE, { force: true });
  process.exit(1);
}

async function stop() {
  const pid = runningPid();
  if (!pid) {
    rmSync(PID_FILE, { force: true });
    console.log("not running");
    return;
  }
  process.kill(pid, "SIGTERM");
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      process.kill(pid, 0);
    } catch {
      rmSync(PID_FILE, { force: true });
      console.log(`stopped pid ${pid}`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  process.kill(pid, "SIGKILL");
  rmSync(PID_FILE, { force: true });
  console.log(`killed pid ${pid} after a slow stop`);
}

async function status() {
  const pid = runningPid();
  const up = await responds();
  console.log(pid ? `pid ${pid}` : "no pid file");
  console.log(up ? `${BASE} answers` : `${BASE} does not answer`);
  if (pid && up) console.log("drivable");
}

const command = process.argv[2];
if (command === "start") await start();
else if (command === "stop") await stop();
else if (command === "status") await status();
else {
  console.error("usage: node serve.mjs start | stop | status");
  process.exit(1);
}
