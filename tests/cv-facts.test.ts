import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The phone belongs in the untracked cv/contact.local.json, which cv:apply
// reads. The tracked facts are published with the repository, so they must not
// carry it.
test("the tracked CV facts carry no phone number", () => {
	const resume = JSON.parse(
		readFileSync(new URL("../cv/resume.json", import.meta.url), "utf8"),
	);
	assert.equal(resume.basics.phone, undefined);
});
