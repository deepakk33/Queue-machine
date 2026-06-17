// Prospect CRUD operations — technical-design §5.2
import { db } from "./index";
import { ProspectStatus, type Prospect } from "../shared/types";

export async function addProspect(
  data: Omit<
    Prospect,
    | "id"
    | "status"
    | "failureReason"
    | "retryCount"
    | "lastAttemptAt"
    | "sentAt"
    | "createdAt"
    | "order"
  >
): Promise<string> {
  const count = await db.prospects.count();
  const prospect: Prospect = {
    ...data,
    id: crypto.randomUUID(),
    status: ProspectStatus.PENDING,
    failureReason: "",
    retryCount: 0,
    lastAttemptAt: null,
    sentAt: null,
    createdAt: Date.now(),
    order: count,
  };
  await db.prospects.add(prospect);
  return prospect.id;
}

export async function updateProspect(
  id: string,
  changes: Partial<Prospect>
): Promise<void> {
  await db.prospects.update(id, changes);
}

export async function deleteProspect(id: string): Promise<void> {
  await db.prospects.delete(id);
}

export async function clearAllProspects(): Promise<void> {
  await db.prospects.clear();
}

export async function getAllProspects(): Promise<Prospect[]> {
  return db.prospects.orderBy("order").toArray();
}

export async function getProspectsByStatus(
  status?: ProspectStatus
): Promise<Prospect[]> {
  if (status) {
    return db.prospects.where("status").equals(status).sortBy("order");
  }
  return db.prospects.orderBy("order").toArray();
}

export async function getPendingWithMessage(): Promise<Prospect[]> {
  return db.prospects
    .where("status")
    .equals(ProspectStatus.PENDING)
    .filter((p) => p.message.trim().length > 0)
    .sortBy("order");
}

export async function getFailedAndSkipped(): Promise<Prospect[]> {
  return db.prospects
    .where("status")
    .anyOf([ProspectStatus.FAILED, ProspectStatus.SKIPPED])
    .sortBy("order");
}

export async function markFailed(id: string, reason: string): Promise<void> {
  const prospect = await db.prospects.get(id);
  if (!prospect) return;

  await db.prospects.update(id, {
    status: ProspectStatus.FAILED,
    failureReason: reason,
    retryCount: prospect.retryCount + 1,
    lastAttemptAt: Date.now(),
  });
}

export async function markSent(id: string): Promise<void> {
  await db.prospects.update(id, {
    status: ProspectStatus.SENT,
    failureReason: "",
    sentAt: Date.now(),
    lastAttemptAt: Date.now(),
  });
}

export async function markSkipped(id: string): Promise<void> {
  await db.prospects.update(id, {
    status: ProspectStatus.SKIPPED,
    lastAttemptAt: Date.now(),
  });
}

export async function resetForRetry(id: string): Promise<void> {
  await db.prospects.update(id, {
    status: ProspectStatus.PENDING,
    failureReason: "",
  });
}

export async function resetAllFailedForRetry(): Promise<void> {
  const failed = await db.prospects
    .where("status")
    .anyOf([ProspectStatus.FAILED, ProspectStatus.SKIPPED])
    .toArray();

  await db.prospects.bulkUpdate(
    failed.map((p) => ({
      key: p.id,
      changes: { status: ProspectStatus.PENDING, failureReason: "" },
    }))
  );
}
