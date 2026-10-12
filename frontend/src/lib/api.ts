export type Health = { status: "ok"; service: string };

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function getHealth(signal?: AbortSignal): Promise<Health> {
  const response = await fetch(`${apiBaseUrl.replace(/\/+$/, "")}/health`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Server returned ${response.status}`);
  const data: unknown = await response.json();
  if (typeof data !== "object" || data === null || !("status" in data) || data.status !== "ok" || !("service" in data) || typeof data.service !== "string") {
    throw new Error("Unexpected health response");
  }
  return { status: "ok", service: data.service };
}
