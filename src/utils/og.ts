import { createHash } from "node:crypto";

// Bump when the OG image layout in src/pages/blog/[slug]/og.png.ts changes.
const OG_TEMPLATE_VERSION = 1;

// Cache-buster for the social preview image: changes whenever the visible OG
// inputs change, so editors do not have to remember to bump it by hand.
export function ogImageVersion(entry: {
	title: string;
	description: string;
	tags: string[];
}): string {
	return createHash("sha1")
		.update(
			JSON.stringify([
				OG_TEMPLATE_VERSION,
				entry.title,
				entry.description,
				entry.tags,
			])
		)
		.digest("hex")
		.slice(0, 10);
}
