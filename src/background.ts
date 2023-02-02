import { createLogger, Logger } from "./utils/logger";

console.log("background");

const injectScriptOnPrPage = (logger: Logger) => {
  const prPagePattern = /https:\/\/github.com\/.+\/.+\/pull\/.+/;

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (
      changeInfo.status === "complete" &&
      tab.url !== undefined &&
      prPagePattern.test(tab.url)
    ) {
      logger.message("inject scripts");
      await chrome.scripting.executeScript({
        target: {
          tabId,
        },
        files: ["contents/copy-commit-hash-in-pr.js"],
      });
      logger.message("injected");
    }
  });
};

const logger = createLogger();
injectScriptOnPrPage(logger);
