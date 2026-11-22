// Bundles the React app into ../app/static with esbuild (no dev server needed).
// Usage: node build.mjs [--watch]
import * as esbuild from "esbuild";
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../app/static");
const watch = process.argv.includes("--watch");

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(resolve(here, "public"), out, { recursive: true });

const options = {
  entryPoints: { main: resolve(here, "src/main.jsx") },
  outdir: resolve(out, "assets"),
  bundle: true,
  splitting: true,
  format: "esm",
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  target: ["es2020", "chrome100", "firefox100", "safari15"],
  jsx: "automatic",
  loader: { ".js": "jsx" },
  entryNames: watch ? "[name]" : "[name]-[hash]",
  chunkNames: "chunks/[name]-[hash]",
  define: { "process.env.NODE_ENV": JSON.stringify(watch ? "development" : "production") },
  logLevel: "info",
  legalComments: "none",
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("Watching for changes…");
} else {
  const result = await esbuild.build({ ...options, metafile: true });
  // Point index.html at the content-hashed entry files.
  const outputs = Object.keys(result.metafile.outputs).map((f) => basename(f));
  const js = outputs.find((f) => /^main-.*\.js$/.test(f));
  const css = outputs.find((f) => /^main-.*\.css$/.test(f));
  const htmlPath = resolve(out, "index.html");
  writeFileSync(htmlPath, readFileSync(htmlPath, "utf8").replace("/assets/main.js", `/assets/${js}`).replace("/assets/main.css", `/assets/${css}`));
  const bytes = Object.values(result.metafile.outputs).reduce((a, o) => a + o.bytes, 0);
  console.log(`Built ${Object.keys(result.metafile.outputs).length} files, ${(bytes / 1024).toFixed(0)} KB → ${out}`);
}
