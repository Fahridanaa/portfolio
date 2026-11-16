import type { APIRoute } from "astro";
import { ogResponse, renderOgImage } from "@/utils/og-image";

export const prerender = true;

export const GET: APIRoute = async () =>
	ogResponse(await renderOgImage({ title: "Art", label: "Doodle pile" }));
