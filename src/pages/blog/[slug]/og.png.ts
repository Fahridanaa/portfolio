import fs from "node:fs/promises";
import path from "node:path";
import { createElement, type CSSProperties } from "react";
import satori from "satori";
import sharp from "sharp";
import { type CollectionEntry } from "astro:content";
import type { APIRoute, GetStaticPaths } from "astro";
import { getBlogEntries } from "@/lib/content";
import { splitText } from "@/utils/og";

export const prerender = true;

type BlogEntry = CollectionEntry<"blog">;

export const getStaticPaths: GetStaticPaths = async () => {
	const entries = await getBlogEntries();

	return entries.map((entry) => ({
		params: { slug: entry.id },
		props: { entry },
	}));
};

const regularFontData = await fs.readFile(
	path.resolve("src/assets/fonts/og/DejaVuSans.ttf")
);
const boldFontData = await fs.readFile(
	path.resolve("src/assets/fonts/og/DejaVuSans-Bold.ttf")
);

const el = (
	type: string,
	style: CSSProperties,
	children?: Parameters<typeof createElement>[2]
) => createElement(type, { style }, children);

export const GET: APIRoute = async ({ props }) => {
	const { entry } = props as { entry: BlogEntry };
	const titleLines = splitText(entry.data.title, 18, 4);

	const svg = await satori(
		el(
			"div",
			{
				width: "100%",
				height: "100%",
				display: "flex",
				position: "relative",
				overflow: "hidden",
				backgroundColor: "#f1f4e9",
				backgroundImage:
					"linear-gradient(rgba(91,126,164,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(91,126,164,0.18) 1px, transparent 1px)",
				backgroundSize: "28px 28px",
				color: "#24312a",
				fontFamily: "DejaVu Sans",
				padding: "58px 68px",
			},
			[
				el("div", {
					position: "absolute",
					inset: "34px 42px",
					backgroundColor: "#fffef8",
					backgroundImage:
						"linear-gradient(rgba(91,126,164,0.2) 1px, transparent 1px), radial-gradient(circle at 24% 18%, rgba(36,49,42,0.04) 0 1px, transparent 1px)",
					backgroundSize: "100% 34px, 34px 34px",
					backgroundPosition: "0 22px, 0 0",
					borderLeft: "1px solid rgba(36,49,42,0.12)",
					borderRight: "1px solid rgba(36,49,42,0.12)",
				}),
				el("div", {
					position: "absolute",
					top: 34,
					bottom: 34,
					left: 128,
					width: 2,
					backgroundColor: "rgba(46,92,55,0.22)",
				}),
				el("div", {
					position: "absolute",
					top: 66,
					left: 92,
					width: 14,
					height: 14,
					backgroundColor: "#2e5c37",
					boxShadow: "20px 0 0 #2e5c37, 40px 0 0 #2e5c37",
				}),
				el("div", {
					position: "absolute",
					right: 86,
					top: 78,
					width: 92,
					height: 34,
					border: "2px solid rgba(36,49,42,0.34)",
					borderRadius: 2,
					transform: "rotate(5deg)",
				}),
				el("div", {
					position: "absolute",
					right: 122,
					top: 64,
					width: 20,
					height: 20,
					backgroundColor: "#c9ef6a",
				}),
				el(
					"div",
					{
						width: "100%",
						height: "100%",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						textAlign: "center",
						position: "relative",
						backgroundColor: "rgba(255,254,248,0.84)",
						backgroundImage:
							"linear-gradient(rgba(91,126,164,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(91,126,164,0.1) 1px, transparent 1px)",
						backgroundSize: "30px 30px",
						border: "2px solid rgba(36,49,42,0.2)",
						borderRadius: 6,
						boxShadow: "0 18px 36px rgba(36,49,42,0.1)",
						padding: "52px 56px",
					},
					[
						el("div", {
							position: "absolute",
							top: -16,
							left: 440,
							width: 178,
							height: 36,
							backgroundColor: "rgba(201,239,106,0.42)",
							border: "2px solid rgba(46,92,55,0.14)",
							transform: "rotate(-1.5deg)",
						}),
						el("div", {
							position: "absolute",
							top: 0,
							bottom: 0,
							left: 54,
							width: 2,
							backgroundColor: "rgba(46,92,55,0.2)",
						}),
						el(
							"div",
							{
								display: "flex",
								flexDirection: "column",
								fontSize: 66,
								fontWeight: 700,
								lineHeight: 1.05,
							},
							titleLines.map((line) => el("div", {}, line))
						),
					]
				),
			]
		),
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: "DejaVu Sans",
					data: regularFontData,
					weight: 400,
					style: "normal",
				},
				{
					name: "DejaVu Sans",
					data: boldFontData,
					weight: 700,
					style: "normal",
				},
			],
		}
	);

	const png = await sharp(Buffer.from(svg)).png().toBuffer();

	return new Response(new Uint8Array(png), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
		},
	});
};
