// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from "@astrojs/mdx";
import tailwind from '@astrojs/tailwind';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
    site: 'https://fahridanaa.my.id',

    integrations: [react(), tailwind({
        applyBaseStyles: false,
    }), mdx()],

    adapter: cloudflare()
});