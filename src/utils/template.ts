// Prompt template token replacement — technical-design §9.1
import type { Prospect } from "../shared/types";

// Token map: template token → prospect field
const TOKEN_MAP: Record<string, keyof Prospect> = {
  "{{name}}": "name",
  "{{designation}}": "designation",
  "{{company}}": "company",
  "{{companyUrl}}": "companyUrl",
  "{{profileUrl}}": "profileUrl",
  "{{notes}}": "notes",
};

export function renderTemplate(template: string, prospect: Prospect): string {
  let result = template;
  for (const [token, field] of Object.entries(TOKEN_MAP)) {
    const value = prospect[field];
    result = result.replaceAll(token, typeof value === "string" ? value : "");
  }
  return result.trim();
}
