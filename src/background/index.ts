// Service worker entry point — technical-design §8.2
import { sendEngine, KEEP_ALIVE_ALARM } from "./send-engine";
import { handleMessage } from "./message-handler";

// Open the side panel when the toolbar icon is clicked.
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(() => {});
});

// Keep-alive: while an alarm fires the worker stays awake. Clear it once the
// engine is idle/completed so the worker can sleep between runs.
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== KEEP_ALIVE_ALARM) return;
  const state = sendEngine.getState();
  if (state === "idle" || state === "completed") {
    chrome.alarms.clear(KEEP_ALIVE_ALARM);
  }
});

// Central message router (panel + content script → worker).
chrome.runtime.onMessage.addListener(handleMessage);
