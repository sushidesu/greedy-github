import fs from "fs/promises"

const main = async () => {
  await fs.mkdir("dist", { recursive: true })
  const manifest = await fs.readFile("manifest.json", "utf8")
  const { $schema, ...rest } = JSON.parse(manifest)
  await fs.writeFile("dist/manifest.json", JSON.stringify(rest, undefined, 2), { flag: "w+" })
}

main()
