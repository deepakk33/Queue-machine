// Zustand store mirroring the send engine's broadcast state in the side panel.
import { create } from "zustand";
import { SendEngineState } from "../shared/types";
import type { SendProgress, RunSummary } from "../shared/types";

interface SendStateStore {
  progress: SendProgress | null;
  summary: RunSummary | null;
  setProgress: (progress: SendProgress) => void;
  setSummary: (summary: RunSummary) => void;
  clearSummary: () => void;
  isActive: () => boolean;
}

const ACTIVE_STATES = new Set<SendEngineState>([
  SendEngineState.RUNNING,
  SendEngineState.SENDING,
  SendEngineState.WAITING,
  SendEngineState.PAUSED,
]);

export const useSendStateStore = create<SendStateStore>((set, get) => ({
  progress: null,
  summary: null,
  setProgress: (progress) => set({ progress }),
  setSummary: (summary) => set({ summary }),
  clearSummary: () => set({ summary: null }),
  isActive: () => {
    const p = get().progress;
    return !!p && ACTIVE_STATES.has(p.engineState);
  },
}));
