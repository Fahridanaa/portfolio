import { type CollectionEntry } from "astro:content";
import type { APIRoute, GetStaticPaths } from "astro";
import { getBlogEntries } from "@/lib/content";
import { ogResponse, renderOgImage } from "@/utils/og-image";

export const prerender = true;

type BlogEntry = CollectionEntry<"blog">;

export const getStaticPaths: GetStaticPaths = async () => {
	const entries = await getBlogEntries();

	return entries.map((entry) => ({
		params: { slug: entry.id },
		props: { entry },
	}));
};

export const GET: APIRoute = async ({ props }) => {
	const { entry } = props as { entry: BlogEntry };

	return ogResponse(
		await renderOgImage({ title: entry.data.title, label: "Blog" })
	);
};
