// Settings read/write — single row keyed by SETTINGS_KEY ("default")
import { db } from "./index";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "../shared/constants";
import type { Settings } from "../shared/types";

export async function getSettings(): Promise<Settings> {
  const stored = await db.settings.get(SETTINGS_KEY);
  if (stored) {
    // Strip the id key before returning a clean Settings object.
    const { id: _id, ...rest } = stored;
    return rest;
  }
  // Seed defaults on first read.
  await db.settings.put({ id: SETTINGS_KEY, ...DEFAULT_SETTINGS });
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await db.settings.put({ id: SETTINGS_KEY, ...settings });
}

export async function updateSettings(
  changes: Partial<Settings>
): Promise<Settings> {
  const current = await getSettings();
  const next = { ...current, ...changes };
  await saveSettings(next);
  return next;
}
