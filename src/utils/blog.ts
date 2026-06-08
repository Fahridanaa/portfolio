import type { CollectionEntry } from "astro:content";

export type BlogEntry = CollectionEntry<"blog">;

export function normalizeTag(tag: string) {
	return `#${tag.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-")}`;
}

export function formatBlogDate(date: Date) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

export function sortBlogEntries(entries: BlogEntry[]) {
	return [...entries].sort((a, b) =>
		a.data.date > b.data.date ? -1 : 1
	);
}

export function shouldShowBlogEntry(entry: BlogEntry) {
	return !import.meta.env.PROD || !entry.data.draft;
}

export function estimateReadingTime(body = "") {
	const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(wordCount / 220));
}
