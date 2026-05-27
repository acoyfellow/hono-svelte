import { Hono } from "hono";
import { svelteRenderer, attachSvelteRoutes } from "../../dist/index.js";
import { bundles } from "./bundles.generated.js";
// @ts-expect-error -- esbuild-svelte emits a Svelte component module; types are not first-class here.
import Hello from "./hello.svelte";

const app = new Hono();
attachSvelteRoutes(app, { bundles });

app.get(
  "/",
  svelteRenderer(Hello, {
    hydrateAs: "hello",
    title: "svelte-hono hello",
    props: { initialCount: 0 },
  }),
);

export default app;
