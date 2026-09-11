import {
	siAstro,
	siBootstrap,
	siJquery,
	siLaravel,
	siMysql,
	siPhp,
	siPostgresql,
	siPython,
	siReact,
	siSvelte,
	siTailwindcss,
	siTypescript,
	type SimpleIcon,
} from "simple-icons";

const ICON_MAP: Record<string, string> = {
	"next.js": "nextjs",
	nextjs: "nextjs",
	"node.js": "nodejs",
	nodejs: "nodejs",
	"prisma orm": "prisma",
	"tailwind css": "tailwindcss",
	"google cloud platform (gcp)": "docker",
	firebase: "docker",
	html: "javascript",
	css: "javascript",
};

const TECH_ICONS: Record<string, SimpleIcon> = {
	astro: siAstro,
	react: siReact,
	typescript: siTypescript,
	tailwindcss: siTailwindcss,
	laravel: siLaravel,
	mysql: siMysql,
	bootstrap: siBootstrap,
	php: siPhp,
	jquery: siJquery,
	svelte: siSvelte,
	python: siPython,
	postgresql: siPostgresql,
};

export function resolveIconName(tech: string): string {
	const key = tech.toLowerCase();
	return ICON_MAP[key] ?? key.replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
}

export function techIcon(tech: string): SimpleIcon | null {
	return TECH_ICONS[resolveIconName(tech)] ?? null;
}

// Inline the brand color as an SVG fill attribute: a `style` attribute would be
// blocked by the CSP `style-src` directive, an SVG presentation attribute is not.
export function techIconSvg(tech: string): string | null {
	const icon = techIcon(tech);
	return icon ? icon.svg.replace("<svg ", `<svg fill="#${icon.hex}" `) : null;
}
