// DOM helpers — technical-design §7.2

// Wait for an element to appear in the DOM.
export function waitForElement(
  selector: string,
  timeoutMs = 10000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(el);
      }
    });

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(
        new Error(`Element not found: ${selector} (timeout ${timeoutMs}ms)`)
      );
    }, timeoutMs);

    observer.observe(document.body, { childList: true, subtree: true });
  });
}

// Wait for any of several selectors — returns the first match.
export function waitForAnyElement(
  selectors: string[],
  timeoutMs = 10000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    for (const sel of selectors) {
      const existing = document.querySelector(sel);
      if (existing) {
        resolve(existing);
        return;
      }
    }

    const observer = new MutationObserver(() => {
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          observer.disconnect();
          clearTimeout(timer);
          resolve(el);
          return;
        }
      }
    });

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(
        new Error(`None found: ${selectors.join(", ")} (timeout ${timeoutMs}ms)`)
      );
    }, timeoutMs);

    observer.observe(document.body, { childList: true, subtree: true });
  });
}

// Set text into a contenteditable div and fire events LinkedIn listens for.
export function simulateTyping(element: HTMLElement, text: string): void {
  element.focus();
  element.innerHTML = "";
  element.textContent = text;

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
  element.dispatchEvent(new KeyboardEvent("keyup", { key: "a", bubbles: true }));
}

// Small random delay to avoid robotic timing.
export function humanDelay(minMs = 300, maxMs = 800): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Is an element visible and clickable?
export function isClickable(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;

  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if ((el as HTMLButtonElement).disabled) return false;

  return true;
}
