export interface OpenSourcePullRequest {
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
}

/**
 * Repositories that stay out of the list below. Coursework and team builds:
 * the HRIS team project and the QuickTube sales-channel course. Add a
 * repository here when a merged pull request must never be reported.
 */
export const OPEN_SOURCE_EXCLUDED_REPOS: string[] = [
	"SukaMajuu/hris2",
	"SukaMajuu/hris",
	"oct-path/QuickTube-SalesChannel",
];

/**
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
 */
export const OPEN_SOURCE_REPOS: OpenSourceRepo[] = [
	{
		name: "elianiva/meiro",
		url: "https://github.com/elianiva/meiro",
		projectSlug: "meiro",
		description: "A lightweight YouTube Music client in Go.",
		language: "Go",
		pulls: [
			{
				number: 215,
				title: "fix(presence): use the byline when no artist is linked",
				summary:
					"Discord presence and the window title fall back to the track byline when a row has no artist link.",
				url: "https://github.com/elianiva/meiro/pull/215",
				mergedAt: "2026-10-24",
				additions: 58,
				deletions: 12,
			},
			{
				number: 183,
				title: "feat(discord): name every artist in rich presence",
				summary:
					"Rich presence now shows the whole credited line instead of only the first artist.",
				url: "https://github.com/elianiva/meiro/pull/183",
				mergedAt: "2026-10-20",
				additions: 87,
				deletions: 34,
			},
			{
				number: 175,
				title: "fix(discord): find a Flatpak Discord IPC socket",
				summary:
					"Dials the socket Flatpak exports, so Rich Presence stops retrying in the dark.",
				url: "https://github.com/elianiva/meiro/pull/175",
				mergedAt: "2026-10-19",
				additions: 360,
				deletions: 11,
			},
			{
				number: 164,
				title: "feat: sign in with Firefox and Zen in the browser window",
				summary:
					"Browser-window sign-in accepts Firefox and Zen, native or Flatpak, instead of Chromium only.",
				url: "https://github.com/elianiva/meiro/pull/164",
				mergedAt: "2026-10-16",
				additions: 1599,
				deletions: 151,
			},
		],
	},
	{
		name: "VeriWorkly/veriworkly",
		url: "https://github.com/VeriWorkly/veriworkly",
		projectSlug: "veriworkly",
		description: "A free resume builder that keeps your data on your device.",
		language: "TypeScript",
		pulls: [
			{
				number: 178,
				title: "[Fix] [Portfolio]: constrain footer link height",
				summary:
					"Stops footer product cards from breaking the layout when the width changes.",
				url: "https://github.com/VeriWorkly/veriworkly/pull/178",
				mergedAt: "2026-07-01",
				additions: 1,
				deletions: 1,
			},
		],
	},
];
