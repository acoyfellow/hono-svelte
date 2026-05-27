<script>
  import Layout from "./Layout.svelte";
  let { path = "/" } = $props();
</script>

<Layout {path}>
  {#snippet body()}
    <section class="hero">
      <h1>Drop a <code>.svelte</code> file in a Hono Worker.<br>That's it.</h1>
      <p class="lede">
        Real Svelte 5. Real SSR. Real hydration. No SvelteKit, no Vite, no scaffolding.
        Just one middleware, one route helper, one build step.
      </p>
      <div class="cta">
        <a class="primary" href="/start">5-min quickstart →</a>
        <a class="secondary" href="https://deploy.workers.cloudflare.com/?url=https://github.com/acoyfellow/hono-svelte" rel="noopener">Deploy the demo</a>
      </div>
    </section>

    <h2>The whole worker</h2>

<pre><code>{`import { Hono } from "hono";
import { svelteRenderer, attachSvelteRoutes } from "hono-svelte";
import Hello from "./hello.svelte";

declare const __HONO_SVELTE_BUNDLES__: Record<string, { js: string; css: string }>;

const app = new Hono();
attachSvelteRoutes(app, { bundles: __HONO_SVELTE_BUNDLES__ });

app.get(
  "/",
  svelteRenderer(Hello, {
    hydrateAs: "hello",
    title: "Hello",
    props: { initialCount: 0 },
  }),
);

export default app;`}</code></pre>

    <p>This page is the receipt — you're reading it. The site you're on is built with hono-svelte. <a href="/why">Why this exists →</a></p>

    <h2>What you get</h2>
    <ul>
      <li><strong>SSR first paint.</strong> The HTML is real, server-rendered Svelte. No blank flash.</li>
      <li><strong>Hydration after.</strong> Click handlers, <code>$state</code>, <code>$effect</code> all work.</li>
      <li><strong>One build step.</strong> <code>buildHonoSvelte()</code> handles both passes.</li>
      <li><strong>Cloudflare Workers native.</strong> No <code>eval</code>, no <code>new Function</code>, no codegen.</li>
      <li><strong>~5 KB library</strong> + your component bundle.</li>
    </ul>
  {/snippet}
</Layout>

<style>
  .hero { padding: 1.5rem 0 2rem; border-bottom: 1px solid var(--line); }
  .lede { font-size: 1.15rem; color: var(--fg-mut); max-width: 60ch; }
  .cta { display: flex; gap: 0.75rem; margin-top: 1.5rem; flex-wrap: wrap; }
  .primary {
    background: var(--accent); color: white;
    padding: 0.65rem 1.1rem; border-radius: 6px; font-weight: 600;
  }
  .primary:hover { text-decoration: none; opacity: 0.92; }
  .secondary {
    border: 1px solid var(--line); color: var(--fg);
    padding: 0.65rem 1.1rem; border-radius: 6px; font-weight: 500; background: white;
  }
  .secondary:hover { text-decoration: none; border-color: var(--fg-mut); }
</style>
