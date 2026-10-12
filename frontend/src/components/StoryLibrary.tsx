"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { PassageSummary } from "@/types/passage";
import type { Language, Level } from "@/types/passage";




const languageOptions: { id: Language; label: string }[] = [
  { id: "shona", label: "Shona" },
  { id: "ndebele", label: "Ndebele" },
];
const levelOptions: { id: Level; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

function filterHref(language: Language | null, level: Level | null) {
  const query = new URLSearchParams();
  if (language) query.set("language", language);
  if (level) query.set("level", level);
  return query.size ? `/library?${query.toString()}` : "/library";
}

export default function StoryLibrary({ passages }: { passages: PassageSummary[] }) {
  const searchParams = useSearchParams();
  const filters = { language: searchParams.get("language"), level: searchParams.get("level") };
  const language = languageOptions.find((item) => item.id === filters.language)?.id ?? null;
  const level = levelOptions.find((item) => item.id === filters.level)?.id ?? null;
  const matches = passages.filter((passage) => (!language || passage.language === language) && (!level || passage.level === level));

  return <section className="library-section">
    <div className="library-heading"><p className="eyebrow">THE STORY LIBRARY</p><h1>Find a story for today.</h1><p>Explore draft passages in Shona and Zimbabwean Ndebele. Choose a language and reading level to narrow the collection.</p></div>
    <div className="library-filters" aria-label="Filter stories">
      <div><h2>Language</h2><div className="filter-options"><Link className={!language ? "active" : ""} aria-current={!language ? "page" : undefined} href={filterHref(null, level)}>All languages</Link>{languageOptions.map((item) => <Link key={item.id} className={language === item.id ? "active" : ""} aria-current={language === item.id ? "page" : undefined} href={filterHref(item.id, level)}>{item.label}</Link>)}</div></div>
      <div><h2>Reading level</h2><div className="filter-options"><Link className={!level ? "active" : ""} aria-current={!level ? "page" : undefined} href={filterHref(language, null)}>All levels</Link>{levelOptions.map((item) => <Link key={item.id} className={level === item.id ? "active" : ""} aria-current={level === item.id ? "page" : undefined} href={filterHref(language, item.id)}>{item.label}</Link>)}</div></div>
    </div>
    <p className="library-count">{matches.length} {matches.length === 1 ? "story" : "stories"} available · Draft content awaiting fluent-speaker review</p>
    {matches.length ? <div className="library-grid">{matches.map((passage) => <article className="library-card" key={passage.id}>
      <div className="library-card-art" aria-hidden="true">✳</div>
      <p className="story-meta">{passage.language === "shona" ? "Shona" : "Ndebele"} · {passage.level.charAt(0).toUpperCase() + passage.level.slice(1)} · {passage.minutes} min · Draft</p>
      <h2>{passage.title}</h2><p>{passage.summary}</p>
      <Link className="card-link" href={`/read/${passage.id}`}>Read story <span aria-hidden="true">→</span></Link>
    </article>)}</div> : <div className="library-empty"><h2>No stories match these filters.</h2><p>Try another language or level.</p><Link className="text-link" href="/library">Show all stories ↗</Link></div>}
  </section>;
}

