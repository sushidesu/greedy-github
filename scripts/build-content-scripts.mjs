import cpy from "cpy"
import { execa } from "execa"
import { globby } from "globby"

const main = async () => {
  await cpy("manifest.json", "dist")
  const contentScriptFiles = await globby("src/contents/*.ts")
  for (const filename of contentScriptFiles) {
    await execa("yarn", ["swc", filename, "-d", "dist"])
  }
}

main()
