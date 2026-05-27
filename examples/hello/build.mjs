import { buildHonoSvelte } from "../../dist/build.js";

const result = await buildHonoSvelte({
  workerEntry: "./worker.ts",
  outDir: "./build",
  components: {
    hello: "./hello.svelte",
  },
});

console.log(`✓ worker  ${(result.workerBytes / 1024).toFixed(1)} KB`);
for (const [id, sizes] of Object.entries(result.bundleSizes)) {
  console.log(`  client ${id}  ${(sizes.js / 1024).toFixed(1)} KB JS + ${(sizes.css / 1024).toFixed(2)} KB CSS`);
}
