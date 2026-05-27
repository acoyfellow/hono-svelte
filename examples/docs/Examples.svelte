<script>
  import Layout from "./Layout.svelte";
  let { path = "/examples" } = $props();
  let count = $state(0);
  let name = $state("");
</script>

<Layout {path}>
  {#snippet body()}
    <h1>Examples</h1>
    <p class="muted">All of these run on this same Worker. Click around — the state on this page is real Svelte 5 reactivity, hydrated server-rendered HTML.</p>

    <h2>Counter (signal state)</h2>
    <div class="card">
      <button onclick={() => count += 1}>clicks: {count}</button>
      <button onclick={() => count = 0}>reset</button>
    </div>
    <p class="muted">Re-renders without a virtual DOM. <code>$state</code> is the whole story.</p>

    <h2>Live input (two-way binding)</h2>
    <div class="card">
      <input placeholder="type something" bind:value={name} />
      <p>hello, <strong>{name || "stranger"}</strong></p>
    </div>

    <h2>Conditional & list rendering</h2>
    <div class="card">
      {#if count > 0}
        <p>You've clicked {count} {count === 1 ? "time" : "times"}.</p>
      {:else}
        <p>Click the counter above.</p>
      {/if}
      {#if count >= 5}
        <ul>
          {#each Array(count) as _, i}
            <li>click #{i + 1}</li>
          {/each}
        </ul>
      {/if}
    </div>

    <h2>Out of scope</h2>
    <p>This library renders Svelte 5 components in a Hono Worker. SSR, hydration, edge cache. Anything beyond that is your code, not this library:</p>
    <ul>
      <li>Want a file-system router? <a href="https://kit.svelte.dev">SvelteKit</a> exists.</li>
      <li>Want streaming SSR? <code>svelte/server</code>'s <code>render()</code> is non-streaming. Build it yourself.</li>
      <li>Want server-side data fetched into props? Pass it through Hono's normal handler. <code>props</code> is yours.</li>
      <li>Want per-component OG images? Write a Hono route. <code>app.get("/og/:slug.png", ...)</code>.</li>
    </ul>
  {/snippet}
</Layout>

<style>
  .card {
    border: 1px solid var(--line);
    background: white;
    padding: 1.25rem;
    border-radius: 8px;
    margin: 0.75rem 0 1.5rem;
  }
  .card button {
    font-size: 1rem;
    padding: 0.5rem 0.9rem;
    margin-right: 0.5rem;
    border-radius: 6px;
    border: 1px solid var(--line);
    background: var(--bg);
    cursor: pointer;
  }
  .card button:hover { border-color: var(--fg-mut); }
  .card input {
    font-size: 1rem;
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--line);
    border-radius: 6px;
    width: min(100%, 320px);
  }
</style>
