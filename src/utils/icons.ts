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

export function resolveIconName(tech: string): string {
	const key = tech.toLowerCase();
	return ICON_MAP[key] ?? key.replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
}

export function iconPath(tech: string): string {
	return `/assets/icons/${resolveIconName(tech)}.svg`;
}
