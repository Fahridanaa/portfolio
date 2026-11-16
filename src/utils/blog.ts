import type { CollectionEntry } from "astro:content";
import { byNewestDate } from "@/utils/sort";

export type BlogEntry = CollectionEntry<"blog">;

export const STICKY_NOTE_CLASSES = [
	"sticky-note-left",
	"sticky-note-center",
	"sticky-note-right",
	"sticky-note-blue-left",
	"sticky-note-pink-center",
	"sticky-note-yellow-right",
];

export function tagSlug(tag: string) {
	return tag.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-");
}

export function normalizeTag(tag: string) {
	return `#${tagSlug(tag)}`;
}

export type BlogTag = {
	slug: string;
	label: string;
	count: number;
};

type TaggedEntry = { data: { tags: string[] } };

export function collectBlogTags(entries: TaggedEntry[]): BlogTag[] {
	const counts = new Map<string, number>();

	for (const entry of entries) {
		const seen = new Set<string>();
		for (const tag of entry.data.tags) {
			const slug = tagSlug(tag);
			if (!slug || seen.has(slug)) continue;
			seen.add(slug);
			counts.set(slug, (counts.get(slug) ?? 0) + 1);
		}
	}

	return [...counts.entries()]
		.map(([slug, count]) => ({ slug, label: `#${slug}`, count }))
		.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function formatBlogDate(date: Date) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

export function sortBlogEntries(entries: BlogEntry[]) {
	return [...entries].sort(byNewestDate);
}

export type YearGroup = {
	year: number;
	entries: BlogEntry[];
};

export function groupBlogEntriesByYear(entries: BlogEntry[]): YearGroup[] {
	const grouped = new Map<number, BlogEntry[]>();
	for (const entry of sortBlogEntries(entries)) {
		const year = entry.data.date.getFullYear();
		const group = grouped.get(year);
		if (group) {
			group.push(entry);
		} else {
			grouped.set(year, [entry]);
		}
	}
	return [...grouped.entries()]
		.map(([year, groupEntries]) => ({ year, entries: groupEntries }))
		.sort((a, b) => b.year - a.year);
}

export function shouldShowBlogEntry(entry: BlogEntry) {
	return !import.meta.env.PROD || !entry.data.draft;
}

export function estimateReadingTime(body = "") {
	const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(wordCount / 220));
}
