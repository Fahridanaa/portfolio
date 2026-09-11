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
