import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPassage, getPassages } from "@/lib/passages";
import ReaderExperience from "@/components/ReaderExperience";

export async function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_STATIC_STORIES !== "true") return [];
  return (await getPassages()).map((passage) => ({ id: passage.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const passage = await getPassage(id);
  return { title: passage ? `${passage.title} | FundaAI` : "Story not found | FundaAI" };
}

export default async function ReadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const passage = await getPassage(id);
  if (!passage) notFound();
  return <ReaderExperience passage={passage} />;
}
