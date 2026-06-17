// Tab navigation and load detection — technical-design §8.1
// Navigates the active tab to a URL and resolves once the page finishes loading.
export function navigateAndWait(
  url: string,
  timeoutMs: number = 15000
): Promise<chrome.tabs.Tab> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error("Page did not load within timeout"));
    }, timeoutMs);

    let targetTabId: number | undefined;

    const listener = (
      updatedTabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: chrome.tabs.Tab
    ) => {
      if (
        updatedTabId === targetTabId &&
        changeInfo.status === "complete" &&
        !settled
      ) {
        settled = true;
        chrome.tabs.onUpdated.removeListener(listener);
        clearTimeout(timer);
        // Extra wait for SPA content to render before resolving.
        setTimeout(() => resolve(tab), 2000);
      }
    };

    (async () => {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      targetTabId = activeTab?.id;
      if (targetTabId === undefined) {
        settled = true;
        clearTimeout(timer);
        reject(new Error("No active tab found"));
        return;
      }
      chrome.tabs.onUpdated.addListener(listener);
      await chrome.tabs.update(targetTabId, { url });
    })().catch((err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(listener);
      reject(err instanceof Error ? err : new Error("Failed to navigate to profile"));
    });
  });
}
