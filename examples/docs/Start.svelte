<script>
  import Layout from "./Layout.svelte";
  let { path = "/start" } = $props();
</script>

<Layout {path}>
  {#snippet body()}
    <h1>5-minute quickstart</h1>
    <p class="muted">Set up a Hono Worker that renders Svelte 5 components. The repo lives at <a href="https://github.com/acoyfellow/hono-svelte">acoyfellow/hono-svelte</a>.</p>

    <h2>1. Install</h2>
<pre><code>{`npm i hono-svelte hono svelte
npm i -D esbuild esbuild-svelte wrangler`}</code></pre>

    <h2>2. Make a component</h2>
<p><code>hello.svelte</code>:</p>
<pre><code>{`<script>
  let { initialCount = 0 } = $props();
  let count = $state(0);
  $effect(() => { count = initialCount; });
</script>

<button onclick={() => count += 1}>clicks: {count}</button>`}</code></pre>

    <h2>3. Make a worker</h2>
<p><code>worker.ts</code>:</p>
<pre><code>{`import { Hono } from "hono";
import { svelteRenderer, attachSvelteRoutes } from "hono-svelte";
import Hello from "./hello.svelte";

declare const __HONO_SVELTE_BUNDLES__: Record<string, { js: string; css: string }>;

const app = new Hono();
attachSvelteRoutes(app, { bundles: __HONO_SVELTE_BUNDLES__ });

app.get("/", svelteRenderer(Hello, { hydrateAs: "hello", title: "Hello" }));

export default app;`}</code></pre>

    <h2>4. Make a build script</h2>
<p><code>build.mjs</code>:</p>
<pre><code>{`import { buildHonoSvelte } from "hono-svelte/build";

await buildHonoSvelte({
  workerEntry: "./worker.ts",
  outDir: "./build",
  components: { hello: "./hello.svelte" },
});`}</code></pre>

    <h2>5. Wire wrangler</h2>
<p><code>wrangler.toml</code>:</p>
<pre><code>{`name = "my-app"
main = "build/worker.bundled.mjs"
compatibility_date = "2026-04-21"
compatibility_flags = ["nodejs_compat"]

[build]
command = "node build.mjs"`}</code></pre>

    <h2>6. Run it</h2>
<pre><code>{`npx wrangler dev
# → http://localhost:8787`}</code></pre>

    <p>Click the button. Counter goes up. You just shipped Svelte 5 on a Worker without SvelteKit.</p>

    <p><a href="/docs">Full API →</a></p>
  {/snippet}
</Layout>
