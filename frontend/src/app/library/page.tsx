import type { Metadata } from "next";
import { Suspense } from "react";
import StoryLibrary from "@/components/StoryLibrary";
import { getPassages } from "@/lib/passages";

export const metadata: Metadata = { title: "Story library | FundaAI" };

export default async function Library() {
  const passages = await getPassages();
  return <Suspense fallback={<p>Loading stories…</p>}><StoryLibrary passages={passages} /></Suspense>;
}
