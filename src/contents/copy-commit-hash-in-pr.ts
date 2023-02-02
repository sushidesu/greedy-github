import { Logger, createLogger } from "../utils/logger";

const BUTTON_ID = "gg-copy-hash-button";

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

    // 既にコピーボタンがる場合は消す
    const oldButtons = c.querySelectorAll(`:scope > button.${BUTTON_ID}`);
    for (const b of oldButtons) {
      c.removeChild(b);
    }

    // コピーボタンを追加
    const copyHashButton = createCopyHashButton(hash);
    c.appendChild(copyHashButton);
  }
};

const createCopyHashButton = (hash: string): HTMLButtonElement => {
  const copyHashButton = document.createElement("button");
  copyHashButton.textContent = "Copy";
  copyHashButton.classList.add("btn", "btn-sm", "ml-2", "mb-1", BUTTON_ID);
  copyHashButton.onclick = () => {
    navigator.clipboard.writeText(hash);
    copyHashButton.textContent = "Copied!";
    logger.message(`copied commit hash ${hash}`);
    setTimeout(() => {
      copyHashButton.textContent = "Copy";
    }, 2000);
  };
  return copyHashButton;
};

const logger = createLogger();
copyCommentHashInPR(logger);
