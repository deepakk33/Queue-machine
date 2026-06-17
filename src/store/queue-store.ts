// Zustand store for the prospect queue. Wraps db/prospects CRUD and keeps an
// in-memory mirror the UI renders from.
import { create } from "zustand";
import type { Prospect, ProspectStatus } from "../shared/types";
import * as prospectDb from "../db/prospects";

type NewProspect = Omit<
  Prospect,
  | "id"
  | "status"
  | "failureReason"
  | "retryCount"
  | "lastAttemptAt"
  | "sentAt"
  | "createdAt"
  | "order"
>;

interface QueueState {
  prospects: Prospect[];
  loading: boolean;
  load: () => Promise<void>;
  add: (data: NewProspect) => Promise<void>;
  update: (id: string, changes: Partial<Prospect>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  retry: (id: string) => Promise<void>;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  prospects: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    const prospects = await prospectDb.getAllProspects();
    set({ prospects, loading: false });
  },

  add: async (data) => {
    await prospectDb.addProspect(data);
    await get().load();
  },

  update: async (id, changes) => {
    await prospectDb.updateProspect(id, changes);
    await get().load();
  },

  remove: async (id) => {
    await prospectDb.deleteProspect(id);
    await get().load();
  },

  clearAll: async () => {
    await prospectDb.clearAllProspects();
    await get().load();
  },

  retry: async (id) => {
    await prospectDb.resetForRetry(id);
    await get().load();
  },
}));

export function countEligible(
  prospects: Prospect[],
  pending: ProspectStatus
): number {
  return prospects.filter(
    (p) => p.status === pending && p.message.trim().length > 0
  ).length;
}
