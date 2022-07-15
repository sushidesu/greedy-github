import { execa } from "execa"
import { globby } from "globby"

const main = async () => {
  const contentScriptFiles = await globby("src/contents/*.ts")
  for (const filename of contentScriptFiles) {
    await execa("yarn", ["esbuild", "--bundle", "--target=es2020", "--minify", "--outdir=dist/contents", filename])
  }
}

main()
