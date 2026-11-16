import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { BLOG_FEED_TITLE } from "@/data/site";
import { byNewestDate } from "@/utils/sort";

export const GET: APIRoute = async (context) => {
	// Read the collection directly: the feed lists every published note,
	// whatever work or personal mode the site is in.
	const entries = (await getCollection("blog"))
		.filter((entry) => !entry.data.draft)
		.sort(byNewestDate);

	return rss({
		title: BLOG_FEED_TITLE,
		description:
			"Casual notes, small thoughts, debugging stories, and things I want to remember out loud.",
		site: context.site ?? context.url.origin,
		items: entries.map((entry) => ({
			title: entry.data.title,
			description: entry.data.description,
			pubDate: entry.data.date,
			link: `/blog/${entry.id}/`,
			categories: entry.data.tags,
		})),
	});
};
