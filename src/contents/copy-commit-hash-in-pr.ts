import { Logger, createLogger } from "../utils/logger";

const BUTTON_ID = "gg-copy-hash-button";
const PROCESSED_ATTR = "data-gg-processed";
const TIMELINE_ITEM_SELECTOR = ".TimelineItem.TimelineItem--condensed";
const COMMIT_LINK_SELECTORS = [
  ".text-right.ml-1 a[href*=\"/commits/\"]",
  "a[href*=\"/commits/\"] > code",
  "a[href*=\"/commit/\"] > code",
  "a.commit-link > tt"
];

const extractHash = (target: Element): string | null => {
  for (const selector of COMMIT_LINK_SELECTORS) {
    const node = target.querySelector(selector);
    const text = node?.textContent?.trim();
    if (!text) continue;

    if (/^[0-9a-f]{7,40}$/i.test(text)) return text;
  }
  return null;
};

const addCopyButton = (item: Element, hash: string) => {
  if (item.getAttribute(PROCESSED_ATTR) === "true") return;

  const oldButtons = item.querySelectorAll(`:scope > button.${BUTTON_ID}`);
  for (const b of Array.from(oldButtons.values())) {
    item.removeChild(b);
  }

  const copyHashButton = createCopyHashButton(hash);
  item.appendChild(copyHashButton);
  item.setAttribute(PROCESSED_ATTR, "true");
};

const processTimelineItems = (root: ParentNode) => {
  const items = Array.from(root.querySelectorAll(TIMELINE_ITEM_SELECTOR));
  for (const item of items) {
    const hash = extractHash(item);
    if (!hash) continue;
    addCopyButton(item, hash);
  }
};

const copyCommentHashInPR = (logger: Logger) => {
  logger.messageOnLoaded();

  processTimelineItems(document);

  const root =
    document.querySelector(".js-discussion") ?? document.body;
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const added of Array.from(mutation.addedNodes.values())) {
        if (!(added instanceof Element)) continue;

        if (added.matches(TIMELINE_ITEM_SELECTOR)) {
          const hash = extractHash(added);
          if (hash) addCopyButton(added, hash);
        }

        processTimelineItems(added);
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });
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
