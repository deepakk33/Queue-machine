// Zustand store for settings. Backed by db/settings (single "default" row).
import { create } from "zustand";
import type { Settings } from "../shared/types";
import { DEFAULT_SETTINGS } from "../shared/constants";
import * as settingsDb from "../db/settings";

interface SettingsState {
  settings: Settings;
  loaded: boolean;
  load: () => Promise<void>;
  save: (changes: Partial<Settings>) => Promise<void>;
  reset: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  load: async () => {
    const settings = await settingsDb.getSettings();
    set({ settings, loaded: true });
  },

  save: async (changes) => {
    const next = await settingsDb.updateSettings(changes);
    set({ settings: next });
  },

  // Overwrite the stored row with DEFAULT_SETTINGS (e.g. to pick up a new
  // default prompt template that an already-seeded install won't get).
  reset: async () => {
    await settingsDb.saveSettings(DEFAULT_SETTINGS);
    set({ settings: DEFAULT_SETTINGS });
  },
}));
