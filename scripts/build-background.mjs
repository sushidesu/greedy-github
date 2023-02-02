import { build } from "esbuild";

const main = async () => {
  const background = "src/background.ts";
  await build({
    entryPoints: [background],
    bundle: true,
    target: "es2020",
    minifyIdentifiers: true,
    minifySyntax: true,
    outdir: "dist",
  });
};

main();
