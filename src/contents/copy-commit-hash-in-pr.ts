import { Logger, createLogger } from "../utils/logger";

const BUTTON_ID = "gg-copy-hash-button";
const PROCESSED_ATTR = "data-gg-processed";
const TIMELINE_ITEM_SELECTOR = ".TimelineItem";
const COMMIT_ITEM_HINT_SELECTOR = ".TimelineItem-badge .octicon-git-commit";
const COMMIT_LINK_SELECTORS = [
  ".text-right.ml-1 a[href*=\"/commits/\"]",
  "a[href*=\"/commits/\"] > code",
  "a[href*=\"/commit/\"] > code",
  "a.commit-link > tt"
];

const extractCommitUrl = (target: Element): string | null => {
  for (const selector of COMMIT_LINK_SELECTORS) {
    const node = target.querySelector(selector);
    const link = node?.closest("a");
    const href = link?.getAttribute("href")?.trim();
    if (!href) continue;
    return new URL(href, window.location.href).toString();
  }
  return null;
};

const addCopyButton = (item: Element, commitUrl: string) => {
  if (item.getAttribute(PROCESSED_ATTR) === "true") return;

  const oldButtons = item.querySelectorAll(`:scope > button.${BUTTON_ID}`);
  for (const b of Array.from(oldButtons.values())) {
    item.removeChild(b);
  }

  const copyHashButton = createCopyHashButton(commitUrl);
  item.appendChild(copyHashButton);
  item.setAttribute(PROCESSED_ATTR, "true");
};

const isCommitItem = (item: Element): boolean => {
  if (item.querySelector(COMMIT_ITEM_HINT_SELECTOR)) return true;
  return COMMIT_LINK_SELECTORS.some((selector) =>
    Boolean(item.querySelector(selector))
  );
};

const processTimelineItems = (root: ParentNode) => {
  const items = Array.from(root.querySelectorAll(TIMELINE_ITEM_SELECTOR));
  for (const item of items) {
    if (!isCommitItem(item)) continue;
    const commitUrl = extractCommitUrl(item);
    if (!commitUrl) continue;
    addCopyButton(item, commitUrl);
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
          if (!isCommitItem(added)) continue;
          const commitUrl = extractCommitUrl(added);
          if (commitUrl) addCopyButton(added, commitUrl);
        }

        processTimelineItems(added);
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });
};

const createCopyHashButton = (commitUrl: string): HTMLButtonElement => {
  const copyHashButton = document.createElement("button");
  copyHashButton.textContent = "Copy";
  copyHashButton.classList.add("btn", "btn-sm", "ml-2", "mb-1", BUTTON_ID);
  copyHashButton.onclick = () => {
    navigator.clipboard.writeText(commitUrl);
    copyHashButton.textContent = "Copied!";
    logger.message(`copied commit url ${commitUrl}`);
    setTimeout(() => {
      copyHashButton.textContent = "Copy";
    }, 2000);
  };
  return copyHashButton;
};

const logger = createLogger();
copyCommentHashInPR(logger);
