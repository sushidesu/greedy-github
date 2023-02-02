import { Logger, createLogger } from "../utils/logger";

const copyCommentHashInPR = (logger: Logger) => {
  logger.messageOnLoaded();
  const commits = document.querySelectorAll(
    ".TimelineItem.TimelineItem--condensed"
  );
  for (const c of Array.from(commits.values())) {
    const hashContainer = c.querySelector(".text-right.ml-1");
    if (hashContainer === null) continue;

    const hash = hashContainer.querySelector("code > a")?.textContent;
    if (typeof hash !== "string") continue;

    const copyHashButton = createCopyHashButton(hash);
    c.appendChild(copyHashButton);
  }
};

const createCopyHashButton = (hash: string): HTMLButtonElement => {
  const copyHashButton = document.createElement("button");
  copyHashButton.id = `greedy-github-copy-hash-button-${hash}`;
  copyHashButton.textContent = "Copy";
  copyHashButton.classList.add("btn", "btn-sm", "ml-2", "mb-1");
  copyHashButton.onclick = () => {
    if (hash) {
      navigator.clipboard.writeText(hash);
      copyHashButton.textContent = "Copied!";
      logger.message(`copied commit hash ${hash}`);
      setTimeout(() => {
        copyHashButton.textContent = "Copy";
      }, 2000);
    }
  };
  return copyHashButton;
};

const logger = createLogger();
copyCommentHashInPR(logger);
