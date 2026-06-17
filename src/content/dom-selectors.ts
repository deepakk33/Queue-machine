// All LinkedIn selectors in one place — technical-design §7.1
// Centralized so DOM breakage is a one-file fix (requirements §13).

// Sales Navigator selectors
export const SN_SELECTORS = {
  // Profile page loaded indicator
  profileLoaded: "[data-x--lead-profile]",
  profileName: ".profile-topcard-person-entity__name",

  // Message button on profile
  messageButton: 'button[data-control-name="message"]',
  messageButtonAlt: "button.message-anywhere-button",

  // Composer modal
  composerModal: ".msg-overlay-conversation-bubble",
  composerInput: 'div.msg-form__contenteditable[contenteditable="true"]',
  composerInputAlt: 'div[role="textbox"][contenteditable="true"]',

  // Send button inside composer
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

// Detection: which LinkedIn surface are we on?
export function detectSurface(): "sales-navigator" | "linkedin" | "unknown" {
  const { hostname, pathname } = window.location;
  if (hostname.includes("linkedin.com") && pathname.startsWith("/sales"))
    return "sales-navigator";
  if (hostname.includes("linkedin.com")) return "linkedin";
  return "unknown";
}
