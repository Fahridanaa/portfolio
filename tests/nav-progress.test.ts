import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldTrackNavigation } from "../src/utils/nav-progress.ts";

const here = "https://example.com/";
const intent = (over: Partial<Parameters<typeof shouldTrackNavigation>[0]> = {}) => ({
	href: "/blog/just-do-it",
	target: null,
	download: null,
	button: 0,
	metaKey: false,
	ctrlKey: false,
	shiftKey: false,
	altKey: false,
	...over,
});

test("tracks a plain same-origin link", () => {
	assert.equal(shouldTrackNavigation(intent(), here), true);
});

test("ignores in-page anchors and the current page", () => {
	assert.equal(shouldTrackNavigation(intent({ href: "#main-content" }), here), false);
	assert.equal(shouldTrackNavigation(intent({ href: "/" }), here), false);
	assert.equal(shouldTrackNavigation(intent({ href: "" }), here), false);
});

test("tracks a same-path link with a different query", () => {
	assert.equal(shouldTrackNavigation(intent({ href: "/?page=2" }), here), true);
});

test("ignores links that open elsewhere", () => {
	assert.equal(shouldTrackNavigation(intent({ metaKey: true }), here), false);
	assert.equal(shouldTrackNavigation(intent({ ctrlKey: true }), here), false);
	assert.equal(shouldTrackNavigation(intent({ button: 1 }), here), false);
	assert.equal(shouldTrackNavigation(intent({ target: "_blank" }), here), false);
	assert.equal(shouldTrackNavigation(intent({ download: "" }), here), false);
});

test("ignores off-site and non-http links", () => {
	assert.equal(shouldTrackNavigation(intent({ href: "https://github.com/x" }), here), false);
	assert.equal(shouldTrackNavigation(intent({ href: "mailto:me@example.com" }), here), false);
	assert.equal(shouldTrackNavigation(intent({ href: null }), here), false);
});
