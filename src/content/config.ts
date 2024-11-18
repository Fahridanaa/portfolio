import { defineCollection, z } from "astro:content";

// const comicCollection = defineCollection({
//     type: "data",
//     schema: z.object({
//         title: z.string(),
//         author: z.string(),
//         type: z.string().transform(str => str.toLowerCase()).pipe(z.enum(["manga", "manhwa", "manhua"])),
//         release: z.coerce.date(),
//         updatedOn: z.coerce.date(),
//         status: z.string().transform(str => str.toLowerCase()).pipe(z.enum(["ongoing", "completed"])),
//         genres: z.array(z.string()),
//         synopsis: z.string(),
//     }),
// });

const projectCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        type: z.string(),
        hasImage: z.boolean().default(true),
        description: z.string(),
        demo: z.string().url().nullable().default(null),
        sourceClient: z.string().url().nullable().default(null),
        sourceServer: z.string().url().nullable().default(null),
        stack: z.array(z.string()),
    }),
});

export const collections = {
    projects: projectCollection,
    // comics: comicCollection,
};
