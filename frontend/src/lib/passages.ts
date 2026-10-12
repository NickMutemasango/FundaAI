import type { Language, Level, Passage, PassageSummary } from "@/types/passage";
import draftPassages from "../../../backend/app/passages.json";

const bundledPassages: Passage[] = draftPassages as Passage[];

const apiBaseUrl = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

export async function getPassages(filters: { language?: Language | null; level?: Level | null } = {}): Promise<PassageSummary[]> {
  if (process.env.NEXT_PUBLIC_STATIC_STORIES === "true") {
    return bundledPassages.filter((passage) => (!filters.language || passage.language === filters.language) && (!filters.level || passage.level === filters.level));
  }
  const query = new URLSearchParams();
  if (filters.language) query.set("language", filters.language);
  if (filters.level) query.set("level", filters.level);
  const url = `${apiBaseUrl}/passages${query.size ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Passage service returned ${response.status}`);
  return response.json() as Promise<PassageSummary[]>;
}

export async function getPassage(id: string): Promise<Passage | null> {
  if (process.env.NEXT_PUBLIC_STATIC_STORIES === "true") return bundledPassages.find((passage) => passage.id === id) ?? null;
  const response = await fetch(`${apiBaseUrl}/passages/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Passage service returned ${response.status}`);
  return response.json() as Promise<Passage>;
}
