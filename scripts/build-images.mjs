import cpy from "cpy"

const main = async () => {
  await cpy("src/images/*.png", "dist/images")
}

main()
