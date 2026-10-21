import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Deployment selectors only: compatibility ranges and intentional test fixtures
// are not installed runtimes. Digests are Docker Hub multi-platform indexes.
const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const checks = [
  ...["pr-policy", "pr-verify", "refresh-lockfile"].map((name) => [
    `.github/workflows/${name}.yml`,
    (text) => assert.deepEqual(
      [...text.matchAll(/^\s*node-version:\s*([^\r\n]+)$/gm)].map((match) => match[1].trim()),
      ['"22.23.4"'],
    ),
  ]),
  ["Dockerfile", (text) => assert.equal(
    text.split(/\r?\n/)[0],
    "FROM node:24.22.1-trixie-slim@sha256:43b9ba1142b8dcf33fa8f922ca1be85714adc444e0586c7cf7726daaeabc1bea AS base",
  )],
  ["docker/openclaw-smoke/Dockerfile", (text) => assert.equal(
    text.split(/\r?\n/)[0],
    "FROM node:22.23.4-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc",
  )],
];

let failures = 0;
for (const [path, check] of checks) {
  try {
    check(read(path));
    console.log(`PASS ${path}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${path}: ${error.message}`);
  }
}
process.exitCode = failures ? 1 : 0;
