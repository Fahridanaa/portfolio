import { test } from "node:test";
import assert from "node:assert/strict";
import { ogImageVersion, splitText } from "../src/utils/og.ts";

test("splitText keeps short text on one line", () => {
	assert.deepEqual(splitText("hello world", 100, 3), ["hello world"]);
});

test("splitText wraps and ellipsizes overflow", () => {
	assert.deepEqual(splitText("aaaa bbbb cccc", 4, 2), ["aaaa", "bbbb..."]);
});

test("ogImageVersion is deterministic and content-sensitive", () => {
	const a = ogImageVersion({ title: "T" });
	const b = ogImageVersion({ title: "T" });
	const c = ogImageVersion({ title: "T2" });
	assert.equal(a, b);
	assert.notEqual(a, c);
	assert.match(a, /^[a-f0-9]{10}$/);
});
