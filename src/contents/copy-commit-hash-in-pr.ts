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
const DEFAULT_COPY_FORMAT = "url-with-pr";
const VALID_COPY_FORMATS = [
  "short-sha",
  "full-sha",
  "url-with-pr",
  "url-without-pr"
] as const;

type CopyFormat = typeof VALID_COPY_FORMATS[number];
type CommitInfo = {
  shortSha: string;
  fullSha: string;
  urlWithPr: string;
  urlWithoutPr: string;
};

const extractCommitInfo = (target: Element): CommitInfo | null => {
  for (const selector of COMMIT_LINK_SELECTORS) {
    const node = target.querySelector(selector);
    const link = node?.closest("a");
    const href = link?.getAttribute("href")?.trim();
    if (!href) continue;
    const commitUrl = new URL(href, window.location.href);
    const fullSha = extractFullSha(commitUrl.pathname);
    if (!fullSha) continue;
    const repoPath = extractRepoPath(commitUrl.pathname);
    if (!repoPath) continue;
    return {
      shortSha: fullSha.slice(0, 7),
      fullSha,
      urlWithPr: commitUrl.toString(),
      urlWithoutPr: `${commitUrl.origin}${repoPath}/commit/${fullSha}`
    };
  }
  return null;
};

const addCopyButton = (
  item: Element,
  info: CommitInfo,
  copyFormat: CopyFormat
) => {
  if (item.getAttribute(PROCESSED_ATTR) === "true") return;

  const oldButtons = item.querySelectorAll(`:scope > button.${BUTTON_ID}`);
  for (const b of Array.from(oldButtons.values())) {
    item.removeChild(b);
  }

  const copyHashButton = createCopyHashButton(info, copyFormat);
  item.appendChild(copyHashButton);
  item.setAttribute(PROCESSED_ATTR, "true");
};

const isCommitItem = (item: Element): boolean => {
  if (item.querySelector(COMMIT_ITEM_HINT_SELECTOR)) return true;
  return COMMIT_LINK_SELECTORS.some((selector) =>
    Boolean(item.querySelector(selector))
  );
};

const processTimelineItems = (root: ParentNode, copyFormat: CopyFormat) => {
  const items = Array.from(root.querySelectorAll(TIMELINE_ITEM_SELECTOR));
  for (const item of items) {
    if (!isCommitItem(item)) continue;
    const info = extractCommitInfo(item);
    if (!info) continue;
    addCopyButton(item, info, copyFormat);
  }
};

const copyCommentHashInPR = async (logger: Logger) => {
  logger.messageOnLoaded();

  const copyFormat = await loadCopyFormat();
  processTimelineItems(document, copyFormat);

  const root =
    document.querySelector(".js-discussion") ?? document.body;
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const added of Array.from(mutation.addedNodes.values())) {
        if (!(added instanceof Element)) continue;

        if (added.matches(TIMELINE_ITEM_SELECTOR)) {
          if (!isCommitItem(added)) continue;
          const info = extractCommitInfo(added);
          if (info) addCopyButton(added, info, copyFormat);
        }

        processTimelineItems(added, copyFormat);
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });
};

const createCopyHashButton = (
  info: CommitInfo,
  copyFormat: CopyFormat
): HTMLButtonElement => {
  const copyHashButton = document.createElement("button");
  copyHashButton.textContent = "Copy";
  copyHashButton.classList.add("btn", "btn-sm", "ml-2", "mb-1", BUTTON_ID);
  copyHashButton.onclick = () => {
    const copyValue = resolveCopyValue(info, copyFormat);
    navigator.clipboard.writeText(copyValue);
    copyHashButton.textContent = "Copied!";
    logger.message(`copied commit ${copyFormat} ${copyValue}`);
    setTimeout(() => {
      copyHashButton.textContent = "Copy";
    }, 2000);
  };
  return copyHashButton;
};

const extractFullSha = (pathname: string): string | null => {
  const commitMatch = pathname.match(/\/commit\/([0-9a-f]{7,40})/i);
  if (commitMatch?.[1]) return commitMatch[1];
  const commitsMatch = pathname.match(/\/commits\/([0-9a-f]{7,40})/i);
  if (commitsMatch?.[1]) return commitsMatch[1];
  return null;
};

const extractRepoPath = (pathname: string): string | null => {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  return `/${parts[0]}/${parts[1]}`;
};

const resolveCopyValue = (info: CommitInfo, copyFormat: CopyFormat): string => {
  switch (copyFormat) {
    case "short-sha":
      return info.shortSha;
    case "full-sha":
      return info.fullSha;
    case "url-without-pr":
      return info.urlWithoutPr;
    case "url-with-pr":
    default:
      return info.urlWithPr;
  }
};

const normalizeCopyFormat = (value: unknown): CopyFormat => {
  if (VALID_COPY_FORMATS.includes(value as CopyFormat)) {
    return value as CopyFormat;
  }
  return DEFAULT_COPY_FORMAT;
};

const loadCopyFormat = async (): Promise<CopyFormat> => {
  const { copyFormat } = await chrome.storage.sync.get({
    copyFormat: DEFAULT_COPY_FORMAT
  });
  return normalizeCopyFormat(copyFormat);
};

const logger = createLogger();
copyCommentHashInPR(logger);
