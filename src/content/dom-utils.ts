// DOM helpers — technical-design §7.2

// Prefixed console logging so a failed send prints exactly what it looked for.
// Uses console.log (not debug) so it shows at the default console level.
export function dmqLog(...args: unknown[]): void {
  // eslint-disable-next-line no-console
  console.log("[DMQ]", ...args);
}

// Read the current text of an editable: .value for form controls, innerText
// for contenteditable. (A <textarea>'s text lives in .value, NOT innerText.)
export function readFieldValue(el: Element): string {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement)
    return el.value;
  return (el as HTMLElement).innerText || el.textContent || "";
}

// Compact one-line description of an element — what selector strategy hit.
export function describe(el: Element | null): string {
  if (!el) return "null";
  const e = el as HTMLElement;
  const attrs: string[] = [];
  const aria = el.getAttribute("aria-label");
  const ce = el.getAttribute("contenteditable");
  const role = el.getAttribute("role");
  const type = el.getAttribute("type");
  if (aria) attrs.push(`aria="${aria}"`);
  if (ce !== null) attrs.push(`contenteditable="${ce}"`);
  if (role) attrs.push(`role="${role}"`);
  if (type) attrs.push(`type="${type}"`);
  const data = Array.from(el.attributes)
    .filter((a) => a.name.startsWith("data-"))
    .map((a) => `${a.name}="${a.value}"`);
  const text = (e.innerText || el.textContent || "").trim().slice(0, 30);
  return `<${el.tagName.toLowerCase()} class="${el.className}" ${attrs.join(
    " "
  )} ${data.join(" ")}>${text ? ` "${text}"` : ""}`;
}

// Dump every relevant candidate as JSON to the console — same shape as the
// capture snippet, so a failed send auto-captures the DOM (no manual snippet).
// Tagged [DMQ-DUMP] for easy console filtering.
export function dumpDiagnostics(label: string): void {
  const dump = (el: Element) => ({
    tag: el.tagName.toLowerCase(),
    text: ((el as HTMLElement).innerText || el.textContent || "")
      .trim()
      .slice(0, 50),
    aria: el.getAttribute("aria-label"),
    ce: el.getAttribute("contenteditable"),
    role: el.getAttribute("role"),
    type: el.getAttribute("type"),
    cls: el.className,
    data: Object.fromEntries(
      Array.from(el.attributes)
        .filter((a) => a.name.startsWith("data-"))
        .map((a) => [a.name, a.value])
    ),
  });
  const candidates = Array.from(
    document.querySelectorAll("button, a, [role=button]")
  )
    .filter((el) =>
      /message|send|inmail|connect/i.test(
        ((el as HTMLElement).innerText || "") +
          " " +
          (el.getAttribute("aria-label") || "")
      )
    )
    .map(dump);
  const editables = Array.from(
    document.querySelectorAll(
      '[contenteditable], [role="textbox"], textarea, input[type="text"]'
    )
  ).map(dump);
  const out = {
    label,
    url: window.location.href,
    path: window.location.pathname,
    candidates,
    editables,
  };
  // eslint-disable-next-line no-console
  console.log("[DMQ-DUMP] " + label + "\n" + JSON.stringify(out, null, 2));
}

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
      dmqLog(`element not found: ${selector} (timeout ${timeoutMs}ms)`);
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
      dmqLog(`none found: ${selectors.join(", ")} (timeout ${timeoutMs}ms)`);
      reject(
        new Error(`None found: ${selectors.join(", ")} (timeout ${timeoutMs}ms)`)
      );
    }, timeoutMs);

    observer.observe(document.body, { childList: true, subtree: true });
  });
}

// A resolution strategy: returns the matching element, or null if not present yet.
export type Strategy = () => Element | null;

// Scan clickable roles for an element whose visible text or aria-label matches
// `pattern`. Resilient to LinkedIn's rotating/obfuscated class names: text and
// aria are far more stable than CSS classes. Returns the first visible match.
export function findClickableByText(
  pattern: RegExp,
  roleSelectors: string[] = ["button", "a", '[role="button"]'],
  root: ParentNode = document
): Element | null {
  const seen = new Set<Element>();
  for (const sel of roleSelectors) {
    for (const el of Array.from(root.querySelectorAll(sel))) {
      if (seen.has(el)) continue;
      seen.add(el);
      const text = (el as HTMLElement).innerText || el.textContent || "";
      const aria = el.getAttribute("aria-label") || "";
      if (!pattern.test(text.trim()) && !pattern.test(aria.trim())) continue;
      if (!isClickable(el)) continue;
      return el;
    }
  }
  return null;
}

// Try ordered strategies (exact selector -> data-attr -> aria -> text scan) on
// each MutationObserver tick. Resolves with the first strategy that hits;
// rejects on timeout, naming how many strategies were tried so the [DMQ] log
// makes the next capture/iteration targeted.
export function resolveElement(
  strategies: Strategy[],
  timeoutMs = 10000,
  label = "element"
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const attempt = (): Element | null => {
      for (const strategy of strategies) {
        try {
          const el = strategy();
          if (el) return el;
        } catch {
          // A bad selector string shouldn't abort the whole resolution.
        }
      }
      return null;
    };

    const immediate = attempt();
    if (immediate) {
      dmqLog(`resolved ${label} immediately`);
      resolve(immediate);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = attempt();
      if (el) {
        observer.disconnect();
        clearTimeout(timer);
        dmqLog(`resolved ${label} after DOM mutation`);
        resolve(el);
      }
    });

    const timer = setTimeout(() => {
      observer.disconnect();
      dmqLog(
        `FAILED to resolve ${label}: ${strategies.length} strategies tried, none matched (timeout ${timeoutMs}ms)`
      );
      reject(
        new Error(
          `Could not find ${label} (${strategies.length} strategies, timeout ${timeoutMs}ms)`
        )
      );
    }, timeoutMs);

    observer.observe(document.body, { childList: true, subtree: true });
  });
}

// Set text into a contenteditable div and fire the events LinkedIn's React
// composer listens for. execCommand("insertText") goes through the browser's
// editing pipeline, so React's input value-tracker registers the change (a raw
// textContent set is often ignored by controlled inputs). Falls back to the
// manual textContent + InputEvent path if execCommand is unavailable/blocked.
export function simulateTyping(element: HTMLElement, text: string): void {
  element.focus();

  // Form controls (<textarea>/<input>) — Sales Nav uses a textarea. Set the
  // value through React's native setter so its value-tracker registers the
  // change, then fire input/change. A plain .value set is ignored by React.
  if (
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLInputElement
  ) {
    const proto =
      element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(element, text);
    else element.value = text;
    element.dispatchEvent(
      new InputEvent("input", { bubbles: true, inputType: "insertText", data: text })
    );
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  // Contenteditable path (regular LinkedIn composer).
  // Select any existing content so insertText replaces it.
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection?.removeAllRanges();
  selection?.addRange(range);

  let inserted = false;
  try {
    inserted = document.execCommand("insertText", false, text);
  } catch {
    inserted = false;
  }

  if (!inserted) {
    dmqLog("execCommand insertText failed; using textContent fallback");
    element.innerHTML = "";
    element.textContent = text;
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: text,
      })
    );
  }

  element.dispatchEvent(new Event("change", { bubbles: true }));
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
