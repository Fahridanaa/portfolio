import { getCollection } from "astro:content";
import { byNewestDate } from "@/utils/sort";
import {
	shouldShowBlogEntry,
	sortBlogEntries,
	type BlogEntry,
} from "@/utils/blog";

export async function getProjects() {
	return (await getCollection("projects")).sort(byNewestDate);
}

export async function getExperiences() {
	return (await getCollection("experiences")).sort(
		(a, b) => b.data.startDate.getTime() - a.data.startDate.getTime()
	);
}

export async function getBlogEntries(): Promise<BlogEntry[]> {
	return sortBlogEntries(
		(await getCollection("blog")).filter(shouldShowBlogEntry)
	);
}
