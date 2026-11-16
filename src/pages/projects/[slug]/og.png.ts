import type { APIRoute, GetStaticPaths } from "astro";
import { getProjects } from "@/lib/content";
import { ogResponse, renderOgImage } from "@/utils/og-image";

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
	const projects = await getProjects();

	return projects.map((project) => ({
		params: { slug: project.id },
		props: { title: project.data.title },
	}));
};

export const GET: APIRoute = async ({ props }) => {
	const { title } = props as { title: string };

	return ogResponse(await renderOgImage({ title, label: "Project" }));
};
