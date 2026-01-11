import fs from "fs/promises"
import { execa } from "execa"

const main = async () => {
  await fs.mkdir("dist", { recursive: true })
  await fs.copyFile("src/options.html", "dist/options.html")
  await execa("yarn", [
    "esbuild",
    "--bundle",
    "--target=es2020",
    "--minify-identifiers",
    "--minify-syntax",
    "--outdir=dist",
    "src/options.ts"
  ])
}

main()
