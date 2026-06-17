// Dexie database definition — technical-design §5.1
import Dexie, { type Table } from "dexie";
import type { Prospect, Settings } from "../shared/types";

export class DmQueueDB extends Dexie {
  prospects!: Table<Prospect, string>;
  settings!: Table<Settings & { id: string }, string>;

  constructor() {
    super("LinkedInDmQueue");

    this.version(1).stores({
      // Indexed fields only — Dexie stores all fields regardless
      prospects: "id, status, createdAt, order",
      settings: "id",
    });
  }
}

export const db = new DmQueueDB();
