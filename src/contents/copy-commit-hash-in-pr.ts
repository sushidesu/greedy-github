import { Logger, createLogger } from "../utils/logger"

const copyCommentHashInPR = (logger: Logger) => {
  logger.messageOnLoaded()
  const commits = document.querySelectorAll(".TimelineItem.TimelineItem--condensed")
  for (const c of Array.from(commits.values())) {
    const hashContainer = c.querySelector(".text-right.ml-1")
    if (hashContainer === null) continue

    const hash = hashContainer.querySelector("code > a")?.textContent
    const copyHashButton = document.createElement("button")
    copyHashButton.textContent = "Copy"
    copyHashButton.classList.add("btn", "btn-sm", "ml-2", "mb-1")
    copyHashButton.onclick = () => {
      if (hash) {
        logger.message(`copied commit hash ${hash}`)
        navigator.clipboard.writeText(hash)
      }
    }
    c.appendChild(copyHashButton)
  }
}

const logger = createLogger()
copyCommentHashInPR(logger)
