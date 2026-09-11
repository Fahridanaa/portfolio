import {
	siAstro,
	siBootstrap,
	siCss,
	siFirebase,
	siGooglecloud,
	siHtml5,
	siJavascript,
	siJquery,
	siLaravel,
	siMysql,
	siNextdotjs,
	siNodedotjs,
	siPhp,
	siPostgresql,
	siPrisma,
	siPython,
	siReact,
	siSvelte,
	siTailwindcss,
	siTypescript,
	type SimpleIcon,
} from "simple-icons";

// Aliases for names that do not normalize to their icon key.
const ICON_MAP: Record<string, string> = {
	"prisma orm": "prisma",
	"google cloud platform (gcp)": "googlecloud",
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
	nextjs: siNextdotjs,
	nodejs: siNodedotjs,
	prisma: siPrisma,
	html: siHtml5,
	css: siCss,
	javascript: siJavascript,
	googlecloud: siGooglecloud,
	firebase: siFirebase,
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
