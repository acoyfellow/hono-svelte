import { buildHonoSvelte } from "../../dist/build.js";

const result = await buildHonoSvelte({
  workerEntry: "./worker.ts",
  outDir: "./build",
  components: {
    home: "./Home.svelte",
    start: "./Start.svelte",
    docs: "./Docs.svelte",
    why: "./Why.svelte",
    examples: "./Examples.svelte",
  },
});

console.log(`✓ worker  ${(result.workerBytes / 1024).toFixed(1)} KB`);
for (const [id, sizes] of Object.entries(result.bundleSizes)) {
  console.log(`  client ${id.padEnd(10)}  ${(sizes.js / 1024).toFixed(1)} KB JS + ${(sizes.css / 1024).toFixed(2)} KB CSS`);
}
