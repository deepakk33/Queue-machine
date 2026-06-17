// All LinkedIn selectors in one place — technical-design §7.1
// Centralized so DOM breakage is a one-file fix (requirements §13).
//
// Each send action exposes a LAYERED strategy list (resolveElement tries them
// in order): exact selector -> data-attr -> aria -> visible-text scan. Text and
// aria are stable across LinkedIn's class-name churn, so a class rename can no
// longer break a send on its own. The exact CSS values below are best-effort
// until verified against a live Sales Navigator lead page (capture snippet in
// the sender feature doc); the text/aria fallbacks carry the load meanwhile.
import { findClickableByText, isClickable, type Strategy } from "./dom-utils";

// Sales Navigator selectors
export const SN_SELECTORS = {
  // Profile page loaded indicator
  profileLoaded: "[data-x--lead-profile]",
  profileName: ".profile-topcard-person-entity__name",

  // Message button on profile (verified: Sales Nav lead topcard, 2026-06-17).
  // Note: the page renders TWO — a hidden sticky-header duplicate and the
  // visible topcard one — so callers must pick the clickable match.
  messageButton: "button[data-anchor-send-inmail]",
  messageButtonAlt: 'button[data-control-name="message"]',

  // Composer (verified: Sales Nav opens an inline panel with a <textarea>,
  // NOT a contenteditable div, 2026-06-17).
  composerModal: ".msg-overlay-conversation-bubble",
  composerInput: 'textarea[aria-label*="message" i]',
  composerInputAlt: 'div.msg-form__contenteditable[contenteditable="true"]',

  // Send button inside composer (verified: text "Send"; class is hashed so
  // text is the anchor, see sendButtonStrategies).
  sendButton: "button.msg-form__send-button",
  sendButtonAlt: 'button[type="submit"].msg-form__send-btn',

  // Composer close / success indicators
  composerClosed: ".msg-overlay-conversation-bubble--is-active-conversation",
  messageSentIndicator: ".msg-s-event-listitem__body",
};

// Regular LinkedIn selectors (fallback surface)
export const LI_SELECTORS = {
  profileLoaded: "main",
  messageButton: "button.message-anywhere-button",
  messageButtonAlt: 'button[aria-label*="Message"]',
  composerInput: 'div.msg-form__contenteditable[contenteditable="true"]',
  composerInputAlt: 'div[role="textbox"][contenteditable="true"]',
  sendButton: "button.msg-form__send-button",
  sendButtonAlt: 'button[type="submit"].msg-form__send-btn',
};

export type Surface = "sales-navigator" | "linkedin" | "unknown";

// Detection: which LinkedIn surface are we on?
export function detectSurface(): Surface {
  const { hostname, pathname } = window.location;
  if (hostname.includes("linkedin.com") && pathname.startsWith("/sales"))
    return "sales-navigator";
  if (hostname.includes("linkedin.com")) return "linkedin";
  return "unknown";
}

// querySelector wrapped as a Strategy (null-safe, lazy).
const q =
  (selector: string): Strategy =>
  () =>
    document.querySelector(selector);

// Like q, but returns the first match that is actually visible/clickable.
// LinkedIn renders hidden duplicate buttons (e.g. a sticky-header Message
// button with zero size); plain querySelector would grab the hidden one.
const qv =
  (selector: string): Strategy =>
  () =>
    Array.from(document.querySelectorAll(selector)).find((el) =>
      isClickable(el)
    ) || null;

// --- Layered strategy lists, ordered most-specific -> most-resilient ---

// Profile loaded indicator. navigateAndWait already waits for tab "complete" +
// 2s, so the page is rendered by the time this runs; this is a soft confirm.
// Ends in `body` so a stale topcard selector can't hard-block the whole send.
export function profileLoadedStrategies(surface: Surface): Strategy[] {
  const sel = surface === "sales-navigator" ? SN_SELECTORS : LI_SELECTORS;
  return [
    q(sel.profileLoaded),
    q("[data-sn-view-name]"),
    q("[data-x--lead-profile]"),
    q("main"),
    q("body"),
  ];
}

// Message button: opens the composer. "Message" text/aria is stable; the
// Sales Nav button may also be an InMail entry point.
export function messageButtonStrategies(surface: Surface): Strategy[] {
  const sel = surface === "sales-navigator" ? SN_SELECTORS : LI_SELECTORS;
  return [
    // The real CTA carries aria-label "Message <name>"; the hidden sticky-header
    // duplicate does not — so lead with aria to win the render race.
    qv('button[aria-label*="Message" i]'),
    qv(sel.messageButton),
    qv(sel.messageButtonAlt),
    () => findClickableByText(/^message$/i),
    () => findClickableByText(/message|inmail/i),
  ];
}

// Composer text input. Sales Nav uses a <textarea>; regular LinkedIn uses a
// contenteditable div. Verified: Sales Nav textarea aria-label "Type your
// message here…". qv picks the visible one (search typeahead is also editable).
export function composerInputStrategies(surface: Surface): Strategy[] {
  const sel = surface === "sales-navigator" ? SN_SELECTORS : LI_SELECTORS;
  return [
    qv(sel.composerInput),
    qv(sel.composerInputAlt),
    qv('textarea[aria-label*="message" i]'),
    qv('div[role="textbox"][contenteditable="true"]'),
    qv(".msg-form__contenteditable"),
    qv('textarea'),
    qv('[role="textbox"]'),
    qv('[contenteditable]:not([contenteditable="false"])'),
  ];
}

// Send button inside the composer. "Send" text is the stable anchor.
export function sendButtonStrategies(surface: Surface): Strategy[] {
  const sel = surface === "sales-navigator" ? SN_SELECTORS : LI_SELECTORS;
  return [
    // Text "Send" is the unambiguous anchor — many buttons carry the same
    // class/data attrs (e.g. "Copy message to clipboard"), so lead with text.
    () => findClickableByText(/^send$/i),
    qv(sel.sendButton),
    qv(sel.sendButtonAlt),
    qv('button[type="submit"]'),
  ];
}
