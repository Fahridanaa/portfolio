import { test } from "node:test";
import assert from "node:assert/strict";
import { byNewestDate } from "../src/utils/sort.ts";

const entry = (date: string) => ({ data: { date: new Date(date) } });

test("byNewestDate orders newest first", () => {
	const older = entry("2024-01-01");
	const newer = entry("2025-01-01");
	assert.ok(byNewestDate(newer, older) < 0);
	assert.ok(byNewestDate(older, newer) > 0);
});

test("byNewestDate returns 0 for equal dates", () => {
	assert.equal(
		byNewestDate(entry("2025-01-01"), entry("2025-01-01")),
		0
	);
});
