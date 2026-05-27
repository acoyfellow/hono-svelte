# hono-svelte

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/acoyfellow/hono-svelte)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Drop a `.svelte` file in a Hono Worker. Real SSR. Real hydration. No SvelteKit.

```ts
import { Hono } from "hono";
import { svelteRenderer, attachSvelteRoutes } from "hono-svelte";
import Hello from "./hello.svelte";

declare const __HONO_SVELTE_BUNDLES__: Record<string, { js: string; css: string }>;

const app = new Hono();
attachSvelteRoutes(app, { bundles: __HONO_SVELTE_BUNDLES__ });

app.get("/", svelteRenderer(Hello, {
  hydrateAs: "hello",
  title: "Hello",
  props: { initialCount: 0 },
}));

export default app;
```

That's it. Live docs: **<https://hono-svelte.coey.dev>**.

## What it does

- Compiles your `.svelte` files at build time (esbuild + esbuild-svelte).
- Server-renders Svelte 5 components on the Worker — real HTML, instant first paint.
- Hydrates on the client — `$state`, `$effect`, event handlers, all of it.
- Stays out of your way. Hono owns routing. You own the rest.
- No `eval`, no `new Function`, no Workers codegen prohibition to dodge.

## Why this exists

Cloudflare Workers disable `eval` and `new Function`. That kills the popular "compile Svelte source at the edge" pattern (search "Code generation from strings disallowed"). This adapter takes the other path: compile at build time, evaluate at request time as a normal ES module. The full story: <https://hono-svelte.coey.dev/why>

## Install

```bash
npm i hono-svelte hono svelte
npm i -D esbuild esbuild-svelte wrangler
```

## Quickstart

1. **A component** — `hello.svelte`:

   ```svelte
   <script>
     let { initialCount = 0 } = $props();
     let count = $state(0);
     $effect(() => { count = initialCount; });
   </script>
   <button onclick={() => count += 1}>clicks: {count}</button>
   ```

2. **A worker** — `worker.ts` (as above).

3. **A build script** — `build.mjs`:

   ```ts
   import { buildHonoSvelte } from "hono-svelte/build";

   await buildHonoSvelte({
     workerEntry: "./worker.ts",
     outDir: "./build",
     components: { hello: "./hello.svelte" },
   });
   ```

4. **A wrangler config** — `wrangler.toml`:

   ```toml
   name = "my-app"
   main = "build/worker.bundled.mjs"
   compatibility_date = "2026-04-21"
   compatibility_flags = ["nodejs_compat"]

   [build]
   command = "node build.mjs"
   ```

5. **Run it**:

   ```bash
   npx wrangler dev
   ```

   Click the button. Counter goes up. You just rendered Svelte 5 on a Worker.

## Examples in this repo

```bash
git clone https://github.com/acoyfellow/hono-svelte
cd hono-svelte
npm install && npm run build

# minimal counter
cd examples/hello && node build.mjs && npx wrangler dev

# full docs site (4 pages, multi-route, OG image, sitemap)
cd examples/docs && node build.mjs && npx wrangler dev
```

The `examples/docs/` site is the live docs at hono-svelte.coey.dev. The site is built with hono-svelte itself — the same primitive you're reading about.

## Comparison

|  | hono-svelte | SvelteKit + adapter-cloudflare | hono/jsx |
|---|---|---|---|
| Routing | Hono | SvelteKit's filesystem | Hono |
| Build | One `node build.mjs` | Vite + adapter | None |
| SSR | Yes | Yes | Yes |
| Client reactivity | Yes (Svelte 5) | Yes | No |
| Conventions | None | Many | None |
| Library size | ~5 KB built | n/a (full framework) | bundled with Hono |

## Status

v0.0.1 — minimal surface. Built, tested live, dogfooded as the docs site. The shape is right; the version doesn't increment until the surface deepens. See [docs](https://hono-svelte.coey.dev/docs) for the API and [why](https://hono-svelte.coey.dev/why) for the rationale.

## License

MIT — see [LICENSE](LICENSE).
