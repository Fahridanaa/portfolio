import type { APIRoute } from "astro";
import { SITE_NAME, SITE_TAGLINE } from "@/data/site";
import { ogResponse, renderOgImage } from "@/utils/og-image";

export const prerender = true;

export const GET: APIRoute = async () =>
	ogResponse(
		await renderOgImage({ title: SITE_NAME, label: SITE_TAGLINE })
	);
