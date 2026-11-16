// Schema.org JSON-LD. Callers pass the visible page data. Keep telephone out:
// the number is private and must never be published.

export type JsonLd = Record<string, unknown>;

export interface PersonSource {
	name: string;
	jobTitle: string;
	description: string;
	image: string;
	email: string;
	sameAs: string[];
}

export interface BlogPostingSource {
	id: string;
	data: {
		title: string;
		description: string;
		date: Date;
		tags: string[];
		lang?: string;
	};
}

export function personJsonLd(site: URL | string, person: PersonSource): JsonLd {
	const origin = new URL(site);

	return {
		"@context": "https://schema.org",
		"@type": "Person",
		"@id": new URL("/#person", origin).href,
		name: person.name,
		url: new URL("/", origin).href,
		image: new URL(person.image, origin).href,
		jobTitle: person.jobTitle,
		description: person.description,
		email: person.email,
		sameAs: person.sameAs,
	};
}

export function blogPostingJsonLd(
	entry: BlogPostingSource,
	options: { site: URL | string; image: string; authorName: string }
): JsonLd {
	const origin = new URL(options.site);
	const pageUrl = new URL(`/blog/${entry.id}/`, origin).href;
	const author = {
		"@type": "Person",
		name: options.authorName,
		url: new URL("/", origin).href,
	};

	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: entry.data.title,
		description: entry.data.description,
		datePublished: entry.data.date.toISOString(),
		inLanguage: entry.data.lang ?? "en",
		url: pageUrl,
		mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
		image: {
			"@type": "ImageObject",
			url: new URL(options.image, origin).href,
			width: 1200,
			height: 630,
		},
		author,
		publisher: author,
		...(entry.data.tags.length > 0
			? { keywords: entry.data.tags.join(", ") }
			: {}),
		isPartOf: {
			"@type": "Blog",
			name: "Blog Notes",
			url: new URL("/blog/", origin).href,
		},
	};
}

/**
 * Serializes JSON-LD for a script element. Escaping `<` keeps a title or
 * description from closing the script tag early.
 */
export function serializeJsonLd(data: JsonLd): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}
