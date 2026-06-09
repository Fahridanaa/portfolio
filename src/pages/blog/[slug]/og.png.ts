import fs from "node:fs/promises";
import path from "node:path";
import { createElement, type CSSProperties } from "react";
import satori from "satori";
import sharp from "sharp";
import { getCollection, type CollectionEntry } from "astro:content";
import type { APIRoute, GetStaticPaths } from "astro";
import { shouldShowBlogEntry } from "@/utils/blog";

export const prerender = true;

type BlogEntry = CollectionEntry<"blog">;

export const getStaticPaths: GetStaticPaths = async () => {
	const entries = (await getCollection("blog")).filter(shouldShowBlogEntry);

	return entries.map((entry) => ({
		params: { slug: entry.slug },
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

const splitText = (value: string, maxLength: number, maxLines: number) => {
	const words = value.split(/\s+/).filter(Boolean);
	const lines: string[] = [];
	let line = "";

	for (const word of words) {
		const nextLine = line ? `${line} ${word}` : word;

		if (nextLine.length > maxLength && line) {
			lines.push(line);
			line = word;
		} else {
			line = nextLine;
		}

		if (lines.length === maxLines) {
			break;
		}
	}

	if (line && lines.length < maxLines) {
		lines.push(line);
	}

	if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
		lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:!?-]+$/, "")}...`;
	}

	return lines;
};

const withHashTag = (tag: string) => `#${tag.replace(/^#/, "").toLowerCase()}`;

export const GET: APIRoute = async ({ props }) => {
	const { entry } = props as { entry: BlogEntry };
	const tags = entry.data.tags.slice(0, 3).map(withHashTag);
	const titleLines = splitText(entry.data.title, 20, 3);
	const descriptionLines = splitText(entry.data.description, 56, 2);

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
						justifyContent: "space-between",
						position: "relative",
						backgroundColor: "rgba(255,254,248,0.84)",
						backgroundImage:
							"linear-gradient(rgba(91,126,164,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(91,126,164,0.1) 1px, transparent 1px)",
						backgroundSize: "30px 30px",
						border: "2px solid rgba(36,49,42,0.2)",
						borderRadius: 6,
						boxShadow: "0 18px 36px rgba(36,49,42,0.1)",
						padding: "52px 56px 40px 86px",
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
							},
							[
								el(
									"div",
									{
										display: "flex",
										alignItems: "center",
										marginBottom: 28,
									},
									[
										el(
											"div",
											{
												color: "#2e5c37",
												fontSize: 26,
												fontWeight: 700,
												textTransform: "uppercase",
												border: "2px solid rgba(46,92,55,0.32)",
												borderRadius: 999,
												padding: "8px 18px",
												backgroundColor: "rgba(201,239,106,0.2)",
											},
											"public notebook"
										),
										el("div", {
											height: 2,
											flex: 1,
											marginLeft: 22,
											borderTop: "3px dashed rgba(36,49,42,0.3)",
										}),
									]
								),
								el(
									"div",
									{
										maxWidth: 850,
										fontSize: 78,
										fontWeight: 700,
										lineHeight: 0.94,
										marginBottom: 24,
										display: "flex",
										flexDirection: "column",
									},
									titleLines.map((line) => el("div", {}, line))
								),
								el("div", {
									width: 250,
									height: 18,
									marginTop: -18,
									marginBottom: 24,
									backgroundColor: "rgba(201,239,106,0.62)",
								}),
								el(
									"div",
									{
										maxWidth: 880,
										color: "#4b564f",
										fontSize: 29,
										fontWeight: 400,
										lineHeight: 1.28,
										display: "flex",
										flexDirection: "column",
									},
									descriptionLines.map((line) => el("div", {}, line))
								),
							]
						),
						el(
							"div",
							{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-end",
								fontSize: 24,
								fontWeight: 700,
							},
							[
								el(
									"div",
									{
										display: "flex",
										flexDirection: "column",
										gap: 6,
									},
									[
										el("div", { color: "#24312a" }, "Fahridana Ahmad Rayyansyah"),
										el("div", { color: "#4b564f", fontSize: 18 }, "blog note"),
									]
								),
								el(
									"div",
									{
										display: "flex",
										gap: 10,
										flexWrap: "wrap",
										justifyContent: "flex-end",
										maxWidth: 420,
									},
									(tags.length ? tags : ["#portfolio"]).map((tag) =>
										el(
											"div",
											{
												color: "#2e5c37",
												border: "2px solid rgba(46,92,55,0.24)",
												borderRadius: 999,
												backgroundColor: "rgba(255,254,248,0.72)",
												padding: "7px 13px",
												fontSize: 20,
											},
											tag
										)
									)
								),
							]
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

	return new Response(png, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
		},
	});
};
