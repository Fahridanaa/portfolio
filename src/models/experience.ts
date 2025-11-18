import type { CollectionEntry } from "astro:content";

export type ExperienceMeta = CollectionEntry<"experiences">["data"];
export type Experience = CollectionEntry<"experiences">;
