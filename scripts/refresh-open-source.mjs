#!/usr/bin/env node
import { readFile, writeFile, appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import process from "node:process";
import {
	OPEN_SOURCE_REPOS,
	OPEN_SOURCE_EXCLUDED_REPOS,
} from "../src/data/open-source.ts";

const AUTHOR = "Fahridanaa";
const DATA_PATH = new URL("../src/data/open-source.ts", import.meta.url);
const TODO_SUMMARY = "TODO: write a one-line summary.";
const MAX_PAGES = 10;
const USAGE = `Usage: node scripts/refresh-open-source.mjs [--body-file PATH]

Reads merged pull requests authored by ${AUTHOR} in the repositories listed in
src/data/open-source.ts and appends the new ones. Requires GITHUB_TOKEN or
GH_TOKEN. Run it locally with:

  GITHUB_TOKEN=$(gh auth token) npm run open-source:refresh`;

const INTERFACES = `export interface OpenSourcePullRequest {
	number: number;
	title: string;
	summary: string;
	url: string;
	mergedAt: string;
	additions: number;
	deletions: number;
}

export interface OpenSourceRepo {
	name: string;
	url: string;
	projectSlug: string;
	description: string;
	language: string;
	pulls: OpenSourcePullRequest[];
}`;

const EXCLUDED_HEADER = `/**
 * Repositories that stay out of the list below. Coursework and team builds:
 * the HRIS team project and the QuickTube sales-channel course. Add a
 * repository here when a merged pull request must never be reported.
 */`;

const REPOS_HEADER = `/**
 * Curated list of merged pull requests to third-party repositories Fahridanaa
 * does not own. Coursework, team repositories, and tutorial PRs are left out;
 * those projects belong to the groups above. The one-line summaries are
 * written by hand.
 *
 * The weekly "Refresh open source pull requests" workflow adds pull requests
 * that merged after the newest entry in each repository. It never rewrites an
 * entry below and never adds a repository. New entries start with a TODO
 * summary, so write one before you merge its branch. Run it locally with:
 *   GITHUB_TOKEN=$(gh auth token) npm run open-source:refresh
 */`;

const SEARCH_QUERY = `query PullRequests($search: String!, $cursor: String) {
	search(query: $search, type: ISSUE, first: 100, after: $cursor) {
		pageInfo {
			hasNextPage
			endCursor
		}
		nodes {
			... on PullRequest {
				number
				title
				url
				mergedAt
				additions
				deletions
				author {
					login
				}
				repository {
					nameWithOwner
					owner {
						login
					}
				}
			}
		}
	}
}`;

function quote(value) {
	return JSON.stringify(value);
}

function formatPull(pull) {
	return [
		"\t\t\t{",
		`\t\t\t\tnumber: ${pull.number},`,
		`\t\t\t\ttitle: ${quote(pull.title)},`,
		"\t\t\t\tsummary:",
		`\t\t\t\t\t${quote(pull.summary)},`,
		`\t\t\t\turl: ${quote(pull.url)},`,
		`\t\t\t\tmergedAt: ${quote(pull.mergedAt)},`,
		`\t\t\t\tadditions: ${pull.additions},`,
		`\t\t\t\tdeletions: ${pull.deletions},`,
		"\t\t\t},",
	].join("\n");
}

function formatRepo(repo) {
	const lines = [
		"\t{",
		`\t\tname: ${quote(repo.name)},`,
		`\t\turl: ${quote(repo.url)},`,
		`\t\tprojectSlug: ${quote(repo.projectSlug)},`,
		`\t\tdescription: ${quote(repo.description)},`,
		`\t\tlanguage: ${quote(repo.language)},`,
	];
	if (repo.pulls.length > 0) {
		lines.push("\t\tpulls: [", ...repo.pulls.map(formatPull), "\t\t],");
	} else {
		lines.push("\t\tpulls: [],");
	}
	lines.push("\t},");
	return lines.join("\n");
}

export function formatOpenSourceModule(repos, excluded = []) {
	const excludedBlock =
		excluded.length > 0
			? [
					"export const OPEN_SOURCE_EXCLUDED_REPOS: string[] = [",
					...excluded.map((name) => `\t${quote(name)},`),
					"];",
				].join("\n")
			: "export const OPEN_SOURCE_EXCLUDED_REPOS: string[] = [];";
	const reposBlock = [
		REPOS_HEADER,
		"export const OPEN_SOURCE_REPOS: OpenSourceRepo[] = [",
		...repos.map(formatRepo),
		"];",
	].join("\n");

	return [INTERFACES, `${EXCLUDED_HEADER}\n${excludedBlock}`, reposBlock].join(
		"\n\n",
	) + "\n";
}

export function splitRepoName(fullName) {
	const parts = fullName.split("/");
	if (parts.length !== 2 || parts.some((part) => part.length === 0)) {
		throw new Error(`Invalid repository name "${fullName}". Use owner/name.`);
	}
	return { owner: parts[0], name: parts[1] };
}

export function validateOpenSourceList(repos, excluded) {
	const excludedNames = new Set(excluded.map((name) => name.toLowerCase()));
	for (const repo of repos) {
		const { owner } = splitRepoName(repo.name);
		const lowerName = repo.name.toLowerCase();
		if (excludedNames.has(lowerName)) {
			throw new Error(
				`${repo.name} is both tracked and excluded. Remove it from one list.`,
			);
		}
		if (owner.toLowerCase() === AUTHOR.toLowerCase()) {
			throw new Error(
				`${repo.name} is Fahridanaa's own repository. The list is for third-party repositories.`,
			);
		}
	}
}

export function latestMergedAt(repos) {
	let latest = "";
	for (const repo of repos) {
		for (const pull of repo.pulls) {
			if (pull.mergedAt > latest) latest = pull.mergedAt;
		}
	}
	return latest;
}

export function mergePulls(repo, fetched) {
	const known = new Set(repo.pulls.map((pull) => pull.number));
	let newest = null;
	for (const pull of repo.pulls) {
		if (
			!newest ||
			pull.mergedAt > newest.mergedAt ||
			(pull.mergedAt === newest.mergedAt && pull.number > newest.number)
		) {
			newest = pull;
		}
	}
	const newestFetched =
		newest && fetched.find((pr) => pr.number === newest.number);
	const isNewer = (pr) => {
		if (!newest) return true;
		if (typeof newestFetched?.mergedAt === "string") {
			return pr.mergedAt > newestFetched.mergedAt;
		}
		const mergedAt = pr.mergedAt.slice(0, 10);
		return (
			mergedAt > newest.mergedAt ||
			(mergedAt === newest.mergedAt && pr.number > newest.number)
		);
	};
	const added = fetched
		.filter(
			(pr) =>
				pr.author?.login?.toLowerCase() === AUTHOR.toLowerCase() &&
				typeof pr.mergedAt === "string" &&
				pr.mergedAt.length > 0,
		)
		.filter((pr) => !known.has(pr.number) && isNewer(pr))
		.map((pr) => ({
			number: pr.number,
			title: pr.title,
			summary: TODO_SUMMARY,
			url: pr.url,
			mergedAt: pr.mergedAt.slice(0, 10),
			additions: pr.additions,
			deletions: pr.deletions,
		}))
		.sort(
			(a, b) =>
				b.mergedAt.localeCompare(a.mergedAt) || b.number - a.number,
		);

	return {
		repo:
			added.length > 0
				? { ...repo, pulls: [...added, ...repo.pulls] }
				: repo,
		added,
	};
}

export function buildSummary({ added, untracked, untrackedError, watermark }) {
	const lines = [];
	if (added.length > 0) {
		lines.push("## New merged pull requests", "");
		for (const { repo, pull } of added) {
			lines.push(
				`- \`${repo}#${pull.number}\` — ${pull.title} — merged ${pull.mergedAt} — +${pull.additions} −${pull.deletions}`,
			);
		}
		lines.push(
			"",
			"## Before merging",
			"",
			"- [ ] Replace every TODO summary with one line in your own words. The workflow never writes summaries.",
			"",
		);
	} else {
		lines.push(
			watermark
				? `No new merged pull requests after ${watermark}.`
				: "No merged pull requests recorded yet.",
			"",
		);
	}

	if (untracked.length > 0) {
		lines.push(
			"## Repositories not on the list",
			"",
			"These have new merged pull requests but are not curated, so nothing was added. Add a project page and an entry if they belong on the site.",
			"",
		);
		for (const { repo, pull } of untracked) {
			lines.push(
				`- \`${repo}#${pull.number}\` — ${pull.title} — merged ${pull.mergedAt.slice(0, 10)}`,
			);
		}
		lines.push("");
	}

	if (untrackedError) {
		lines.push(
			"## Check skipped",
			"",
			`The scan for new repositories failed: ${untrackedError}`,
			"",
		);
	}

	return lines.join("\n").trimEnd();
}

async function githubRequest(query, variables, token) {
	const response = await fetch("https://api.github.com/graphql", {
		method: "POST",
		headers: {
			authorization: `bearer ${token}`,
			"content-type": "application/json",
			"user-agent": "fahridanaa-portfolio-open-source-refresh",
		},
		body: JSON.stringify({ query, variables }),
	});
	const text = await response.text();
	let payload;
	try {
		payload = JSON.parse(text);
	} catch {
		throw new Error(
			`GitHub returned ${response.status}: ${text.slice(0, 300)}`,
		);
	}
	if (!response.ok || payload.errors?.length > 0) {
		const detail =
			payload.errors?.map((error) => error.message).join("; ") ??
			text.slice(0, 300);
		throw new Error(`GitHub GraphQL failed (${response.status}): ${detail}`);
	}
	return payload.data;
}

async function searchAll(search, token) {
	const results = [];
	let cursor = null;
	for (let page = 0; page < MAX_PAGES; page++) {
		const data = await githubRequest(SEARCH_QUERY, { search, cursor }, token);
		const connection = data.search;
		results.push(...connection.nodes.filter(Boolean));
		if (!connection.pageInfo.hasNextPage) return results;
		cursor = connection.pageInfo.endCursor;
	}
	throw new Error(
		`More than ${MAX_PAGES * 100} results for "${search}". Narrow the query.`,
	);
}

async function fetchRepoPulls(fullName, token) {
	const { owner, name } = splitRepoName(fullName);
	const search = `repo:${owner}/${name} is:pr is:merged author:${AUTHOR}`;
	return searchAll(search, token);
}

async function findUntracked(token, watermark, repos, excluded) {
	if (!watermark) return [];
	const search = `is:pr is:merged author:${AUTHOR} -user:${AUTHOR} merged:>=${watermark}`;
	const nodes = await searchAll(search, token);
	const tracked = new Set(repos.map((repo) => repo.name.toLowerCase()));
	const skipped = new Set(excluded.map((name) => name.toLowerCase()));
	const seen = new Set();
	const found = [];

	for (const pr of nodes) {
		if (!pr.repository || !pr.mergedAt) continue;
		const repoName = pr.repository.nameWithOwner;
		const lowerName = repoName.toLowerCase();
		const key = `${lowerName}#${pr.number}`;
		if (tracked.has(lowerName) || skipped.has(lowerName)) continue;
		if (pr.repository.owner.login.toLowerCase() === AUTHOR.toLowerCase()) {
			continue;
		}
		if (pr.author?.login?.toLowerCase() !== AUTHOR.toLowerCase()) continue;
		if (pr.mergedAt.slice(0, 10) < watermark) continue;
		if (seen.has(key)) continue;
		seen.add(key);
		found.push({ repo: repoName, pull: pr });
	}

	return found.sort((a, b) =>
		b.pull.mergedAt.localeCompare(a.pull.mergedAt),
	);
}

function parseArgs(argv) {
	const options = { bodyFile: null, help: false };
	for (let index = 0; index < argv.length; index++) {
		const arg = argv[index];
		if (arg === "--body-file") {
			const value = argv[++index];
			if (!value) throw new Error("--body-file needs a path.");
			options.bodyFile = value;
		} else if (arg === "--help" || arg === "-h") {
			options.help = true;
		} else {
			throw new Error(`Unknown argument "${arg}".`);
		}
	}
	return options;
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		console.log(USAGE);
		return;
	}

	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	if (!token) {
		throw new Error(
			"Set GITHUB_TOKEN or GH_TOKEN. Locally: GITHUB_TOKEN=$(gh auth token) npm run open-source:refresh",
		);
	}

	const repos = OPEN_SOURCE_REPOS;
	const excluded = OPEN_SOURCE_EXCLUDED_REPOS ?? [];
	validateOpenSourceList(repos, excluded);
	const watermark = latestMergedAt(repos);

	let untracked = [];
	let untrackedError = "";
	try {
		untracked = await findUntracked(token, watermark, repos, excluded);
	} catch (error) {
		untrackedError = error.message;
		console.warn(`Could not scan other repositories: ${error.message}`);
	}

	const updatedRepos = [];
	const added = [];
	for (const repo of repos) {
		const fetched = await fetchRepoPulls(repo.name, token);
		const result = mergePulls(repo, fetched);
		updatedRepos.push(result.repo);
		for (const pull of result.added) {
			added.push({ repo: repo.name, pull });
		}
	}

	const before = await readFile(DATA_PATH, "utf8");
	const after = formatOpenSourceModule(updatedRepos, excluded);
	if (after !== before) {
		await writeFile(DATA_PATH, after, "utf8");
		console.log(`Updated src/data/open-source.ts (${added.length} new).`);
	} else {
		console.log(`No changes (${repos.length} repositories checked).`);
	}

	const summary = buildSummary({ added, untracked, untrackedError, watermark });
	if (options.bodyFile) {
		await writeFile(`${options.bodyFile}`, `${summary}\n`, "utf8");
	}
	if (process.env.GITHUB_STEP_SUMMARY) {
		await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
	}
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	main().catch((error) => {
		console.error(`refresh-open-source: ${error.message}`);
		process.exitCode = 1;
	});
}
