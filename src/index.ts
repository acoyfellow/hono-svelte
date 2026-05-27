// hono-svelte: render Svelte 5 components inside a Hono Worker.
//
// Pattern modeled on Hono's own helpers (`jsxRenderer`, `serveStatic`,
// `logger`): a small factory that returns a `MiddlewareHandler`. Svelte
// components are imported normally — at build time, esbuild + esbuild-svelte
// produce SSR + client modules. No `eval`, no `new Function`, no V8
// codegen prohibition issues on Cloudflare Workers.
//
// Usage:
//
//   import { Hono } from "hono";
//   import { svelteRenderer, attachSvelteRoutes } from "hono-svelte";
//   import Hello from "./hello.svelte";
//   import HelloClient from "./hello.svelte?client";
//
//   const app = new Hono();
//
//   attachSvelteRoutes(app, {
//     // Map hash -> client bundle source. The build script generates this.
//     bundles: {
//       hello: { js: HelloClient.js, css: HelloClient.css },
//     },
//   });
//
//   app.get("/", svelteRenderer(Hello, { hydrateAs: "hello", title: "Hello" }));
//
// The companion build script (examples/hello/build.mjs) is what produces
// the `?client` artifacts. The adapter itself stays tiny and runtime-only.

import type { Hono, MiddlewareHandler } from "hono";
import { render as svelteRender } from "svelte/server";

export interface SvelteRendererOptions {
  /** Stable id (hash, slug, anything) that picks the matching client bundle
   *  registered via `attachSvelteRoutes({ bundles })`. */
  hydrateAs: string;
  /** Props passed to the component during SSR and hydration. */
  props?: Record<string, unknown>;
  /** Page title. */
  title?: string;
  /** Extra `<head>` content (meta tags, fonts, links). */
  head?: string;
  /** Body class string. */
  bodyClass?: string;
}

export interface ClientBundle {
  /** ES module source for the client-side hydratable component. */
  js: string;
  /** Scoped CSS extracted from the component. Empty string if none. */
  css: string;
}

export interface AttachSvelteRoutesOptions {
  /** Pre-built client bundles, keyed by the same id used in `hydrateAs`. */
  bundles: Record<string, ClientBundle>;
  /** Mount prefix for compiled artifact routes. Defaults to "/__svelte". */
  prefix?: string;
}

const TAG = "__hono_svelte_mounted__";

let registeredBundles: Record<string, ClientBundle> = {};
let mountPrefix = "/__svelte";

/**
 * Register the routes that serve compiled Svelte artifacts.
 *
 * Must be called once on the Hono app instance, before any
 * `svelteRenderer(...)` handlers run. Idempotent per app instance.
 */
export function attachSvelteRoutes(
  app: Hono,
  options: AttachSvelteRoutesOptions,
): void {
  registeredBundles = options.bundles;
  mountPrefix = options.prefix ?? "/__svelte";

  const tagged = app as unknown as Record<string, boolean>;
  if (tagged[TAG]) return;
  tagged[TAG] = true;

  app.get(`${mountPrefix}/:filename`, (c) => {
    const filename = c.req.param("filename");
    const m = filename.match(/^([a-zA-Z0-9_\-]+)\.(js|css)$/);
    if (!m) return c.notFound();
    const [, id, ext] = m;
    const bundle = registeredBundles[id];
    if (!bundle) return c.notFound();
    if (ext === "js") {
      return new Response(bundle.js, {
        headers: {
          "content-type": "application/javascript; charset=utf-8",
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    }
    return new Response(bundle.css, {
      headers: {
        "content-type": "text/css; charset=utf-8",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function shell(
  rendered: { body: string; head: string },
  bundleId: string,
  hasCss: boolean,
  opts: SvelteRendererOptions,
): string {
  const cssLink = hasCss ? `<link rel="stylesheet" href="${mountPrefix}/${bundleId}.css">` : "";
  const title = opts.title ? `<title>${escapeHtml(opts.title)}</title>` : "";
  const extraHead = opts.head ?? "";
  const bodyClass = opts.bodyClass ? ` class="${escapeHtml(opts.bodyClass)}"` : "";
  const propsJson = JSON.stringify(opts.props ?? {});

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${title}
${cssLink}
${extraHead}
${rendered.head}
</head>
<body${bodyClass}>
<div id="hono-svelte-root">${rendered.body}</div>
<script type="module">
import { hydrate } from "${mountPrefix}/${bundleId}.js";
hydrate(${propsJson});
</script>
</body>
</html>`;
}

/**
 * Returns a Hono middleware that responds with an HTML document rendered
 * from a built Svelte component. The component must be a Svelte 5
 * component imported normally (SSR build); the matching client bundle
 * must be registered via `attachSvelteRoutes`.
 */
export function svelteRenderer<Props extends Record<string, unknown> = Record<string, unknown>>(
  // The SSR build of `*.svelte` is a function with svelte/server's render
  // signature; types are loose because the esbuild-svelte loader emits a
  // raw value rather than a typed module.
  component: unknown,
  options: SvelteRendererOptions,
): MiddlewareHandler {
  return async (c) => {
    const props = (options.props ?? {}) as Props;
    const out = svelteRender(component as never, { props: props as never });
    return c.html(shell({ body: out.body, head: out.head }, options.hydrateAs, true, options));
  };
}
