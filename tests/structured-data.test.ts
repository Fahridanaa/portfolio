import { test } from "node:test";
import assert from "node:assert/strict";
import {
	blogPostingJsonLd,
	personJsonLd,
	serializeJsonLd,
} from "../src/utils/structured-data.ts";

const site = "https://fahridanaa.my.id";

const person = {
	name: "Fahridana Ahmad Rayyansyah",
	jobTitle: "Full-stack Developer",
	description:
		"Full-stack developer building web apps and keeping the work simple. Projects, open-source contributions, notes, and drawings by Fahridana Ahmad Rayyansyah.",
	image: "/assets/me.jpg",
	email: "fahridanaaa@gmail.com",
	sameAs: [
		"https://www.linkedin.com/in/fahridana-ahmad-rayyansyah/",
		"https://github.com/Fahridanaa",
	],
};

test("personJsonLd describes the owner without a phone number", () => {
	const data = personJsonLd(site, person);
	const serialized = JSON.stringify(data);

	assert.equal(data["@type"], "Person");
	assert.equal(data.name, "Fahridana Ahmad Rayyansyah");
	assert.equal(data.url, "https://fahridanaa.my.id/");
	assert.equal(data.image, "https://fahridanaa.my.id/assets/me.jpg");
	assert.equal(data.jobTitle, "Full-stack Developer");
	assert.equal(data.description, person.description);
	assert.deepEqual(data.sameAs, person.sameAs);
	assert.ok(!("telephone" in data));
	assert.ok(!serialized.includes("+62"));
});

test("blogPostingJsonLd describes a post with its author and share image", () => {
	const entry = {
		id: "just-do-it",
		data: {
			title: "Just Do It",
			description: "Tentang overthinking.",
			date: new Date("2026-08-07T00:00:00.000Z"),
			tags: ["personal", "reflection"],
			lang: "id",
		},
	};

	const post = blogPostingJsonLd(entry, {
		site,
		image: "/blog/just-do-it/og.png?v=abc123",
		authorName: "Fahridana Ahmad Rayyansyah",
	});

	assert.equal(post["@type"], "BlogPosting");
	assert.equal(post.headline, "Just Do It");
	assert.equal(post.datePublished, "2026-08-07T00:00:00.000Z");
	assert.equal(post.inLanguage, "id");
	assert.equal(post.url, "https://fahridanaa.my.id/blog/just-do-it/");
	assert.deepEqual(post.mainEntityOfPage, {
		"@type": "WebPage",
		"@id": "https://fahridanaa.my.id/blog/just-do-it/",
	});
	assert.deepEqual(post.image, {
		"@type": "ImageObject",
		url: "https://fahridanaa.my.id/blog/just-do-it/og.png?v=abc123",
		width: 1200,
		height: 630,
	});
	assert.equal(post.keywords, "personal, reflection");
	assert.equal((post.author as { name: string }).name, "Fahridana Ahmad Rayyansyah");
});

test("serializeJsonLd escapes markup without changing the parsed value", () => {
	const value = { title: "</script><script>alert(1)</script>" };
	const serialized = serializeJsonLd(value);

	assert.ok(!serialized.includes("</script>"));
	assert.deepEqual(JSON.parse(serialized), value);
});
