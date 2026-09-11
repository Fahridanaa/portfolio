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

// Wraps text into at most `maxLines` lines of `maxLength` characters,
// appending an ellipsis when content is dropped.
export function splitText(
	value: string,
	maxLength: number,
	maxLines: number
): string[] {
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

	if (
		lines.length === maxLines &&
		words.join(" ").length > lines.join(" ").length
	) {
		lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:!?-]+$/, "")}...`;
	}

	return lines;
}
