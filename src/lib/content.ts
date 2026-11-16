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

export async function getProjectGroups() {
	const projects = await getProjects();

	return {
		university: projects.filter((p) => p.data.group === "university"),
		personal: projects.filter((p) => p.data.group === "personal"),
		openSource: projects.filter((p) => p.data.group === "open-source"),
	};
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
