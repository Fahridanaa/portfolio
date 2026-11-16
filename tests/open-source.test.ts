import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
	OPEN_SOURCE_EXCLUDED_REPOS,
	OPEN_SOURCE_REPOS,
} from "../src/data/open-source.ts";
import {
	buildSummary,
	formatOpenSourceModule,
	latestMergedAt,
	mergePulls,
	validateOpenSourceList,
} from "../scripts/refresh-open-source.mjs";

const repo = {
	name: "elianiva/meiro",
	url: "https://github.com/elianiva/meiro",
	projectSlug: "meiro",
	description: "A lightweight YouTube Music client in Go.",
	language: "Go",
	pulls: [
		{
			number: 215,
			title: "old title",
			summary: "hand written summary",
			url: "https://github.com/elianiva/meiro/pull/215",
			mergedAt: "2026-10-24",
			additions: 58,
			deletions: 12,
		},
	],
};

const pr = (number: number, mergedAt: string, login = "Fahridanaa") => ({
	number,
	title: `title ${number}`,
	url: `https://github.com/elianiva/meiro/pull/${number}`,
	mergedAt,
	additions: 1,
	deletions: 2,
	author: { login },
	repository: {
		nameWithOwner: "elianiva/meiro",
		owner: { login: "elianiva" },
	},
});

test("mergePulls adds a newer merged PR and keeps the curated entry", () => {
	const result = mergePulls(repo, [pr(216, "2026-11-16T10:00:00Z")]);

	assert.equal(result.added.length, 1);
	assert.equal(result.repo.pulls.length, 2);
	assert.equal(result.repo.pulls[0].number, 216);
	assert.equal(result.repo.pulls[0].mergedAt, "2026-11-16");
	assert.equal(
		result.repo.pulls[0].summary,
		"TODO: write a one-line summary.",
	);
	assert.deepEqual(result.repo.pulls[1], repo.pulls[0]);
});

test("mergePulls ignores duplicates and PRs merged before the newest entry", () => {
	const result = mergePulls(repo, [
		pr(215, "2026-10-24T06:45:55Z"),
		pr(200, "2026-10-01T10:00:00Z"),
	]);

	assert.equal(result.added.length, 0);
	assert.equal(result.repo, repo);
});

test("mergePulls adds a lower-numbered PR merged after the newest entry", () => {
	const result = mergePulls(repo, [
		pr(215, "2026-10-24T06:45:55Z"),
		pr(200, "2026-11-16T10:00:00Z"),
	]);

	assert.equal(result.added.length, 1);
	assert.equal(result.repo.pulls[0].number, 200);
});

test("mergePulls ignores PRs by other authors", () => {
	const result = mergePulls(repo, [
		pr(216, "2026-11-16T10:00:00Z", "someone-else"),
	]);

	assert.equal(result.added.length, 0);
});

test("mergePulls accepts a same-day PR merged after the newest entry", () => {
	const result = mergePulls(repo, [
		pr(215, "2026-10-24T06:45:55Z"),
		pr(216, "2026-10-24T23:00:00Z"),
	]);

	assert.equal(result.added.length, 1);
	assert.equal(result.repo.pulls[0].number, 216);
});

test("mergePulls sorts added PRs newest first", () => {
	const result = mergePulls(repo, [
		pr(215, "2026-10-24T06:45:55Z"),
		pr(216, "2026-11-15T10:00:00Z"),
		pr(217, "2026-11-16T10:00:00Z"),
	]);

	assert.deepEqual(
		result.repo.pulls.slice(0, 2).map((pull: { number: number }) => pull.number),
		[217, 216],
	);
});

test("formatOpenSourceModule reproduces the checked-in data file", async () => {
	const actual = await readFile(
		new URL("../src/data/open-source.ts", import.meta.url),
		"utf8",
	);
	assert.equal(
		formatOpenSourceModule(OPEN_SOURCE_REPOS, OPEN_SOURCE_EXCLUDED_REPOS),
		actual,
	);
});

test("validateOpenSourceList rejects a repository in both lists", () => {
	assert.throws(
		() => validateOpenSourceList([repo], ["elianiva/meiro"]),
		/both tracked and excluded/,
	);
});

test("validateOpenSourceList rejects a repository Fahridanaa owns", () => {
	assert.throws(
		() => validateOpenSourceList([{ ...repo, name: "Fahridanaa/muara" }], []),
		/own repository/,
	);
});

test("the checked-in lists do not overlap", () => {
	assert.doesNotThrow(() =>
		validateOpenSourceList(OPEN_SOURCE_REPOS, OPEN_SOURCE_EXCLUDED_REPOS),
	);
});

test("latestMergedAt returns the newest date", () => {
	assert.equal(latestMergedAt([repo]), "2026-10-24");
	assert.equal(latestMergedAt([]), "");
});

test("buildSummary lists new PRs, TODO work, and untracked candidates", () => {
	const summary = buildSummary({
		added: [{ repo: "elianiva/meiro", pull: repo.pulls[0] }],
		untracked: [{ repo: "someone/project", pull: pr(3, "2026-11-16T09:00:00Z") }],
		untrackedError: "",
		watermark: "2026-10-24",
	});

	assert.match(summary, /elianiva\/meiro#215/);
	assert.match(summary, /TODO summary/);
	assert.match(summary, /someone\/project#3/);
});

test("buildSummary reports a clean run", () => {
	const summary = buildSummary({
		added: [],
		untracked: [],
		untrackedError: "",
		watermark: "2026-10-24",
	});

	assert.match(summary, /No new merged pull requests after 2026-10-24/);
});
