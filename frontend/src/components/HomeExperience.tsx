"use client";

import { useState } from "react";
import Link from "next/link";
import type { Language, Level, PassageSummary } from "@/types/passage";

const levels: { id: Level; name: string; description: string }[] = [
  { id: "beginner", name: "Beginner", description: "Short stories. Small steps." },
  { id: "intermediate", name: "Intermediate", description: "New words. Growing confidence." },
  { id: "advanced", name: "Advanced", description: "Longer ideas. Deeper understanding." },
];

export default function HomeExperience({ passages }: { passages: PassageSummary[] }) {
  const [language, setLanguage] = useState<Language>("shona");
  const [level, setLevel] = useState<Level>("beginner");
  const passage = passages.find((item) => item.language === language && item.level === level);
  const languageName = language === "shona" ? "Shona" : "Ndebele";
  const levelName = levels.find((item) => item.id === level)!.name;

  return <>
    <section className="hero">
      <div>
        <p className="eyebrow">YOUR LANGUAGE. YOUR NEXT CHAPTER.</p>
        <h1>Find your voice.<br /><em>One story at a time.</em></h1>
        <p className="hero-description">Make room for a little reading. Explore stories in Shona and Ndebele, discover new words, and grow at your own pace.</p>
        <a className="text-link" href="#choose">Let’s find your first story ↗</a>
        <div className="hero-details"><span>✳ Two languages</span><span>✳ Three reading levels</span><span>✳ Your own pace</span></div>
      </div>
      <div className="book-scene" aria-hidden="true">
        <span className="orbit" /><span className="floating-word word-one">Mhoro!</span><span className="floating-word word-two">Sawubona!</span>
        <div className="book"><div className="book-top">THE EVERYDAY<br />READING COLLECTION</div><div className="book-title">Small stories.<br /><i>Big beginnings.</i></div><div className="book-flower">✳</div><div className="book-bottom">SHONA & NDEBELE · VOL. 01</div></div>
        <span className="scene-caption">Rooted in language. Open to possibility.</span>
      </div>
    </section>
    <section className="learning-section" id="choose">
      <div className="section-heading"><div><p className="eyebrow">A GOOD PLACE TO BEGIN</p><h2>Make this chapter yours.</h2></div><p>Choose a language and a comfortable starting point.</p></div>
      <div className="chooser-grid">
        <div className="selection-panel">
          <fieldset><legend><span className="step-number">01</span> Choose your language</legend><div className="language-options">{(["shona", "ndebele"] as Language[]).map((item) => <button type="button" key={item} className={`language-card ${language === item ? "selected" : ""}`} aria-pressed={language === item} onClick={() => setLanguage(item)}><span className="language-greeting">{item === "shona" ? "Mhoro" : "Sawubona"}</span><span>{item === "shona" ? "Shona" : "Ndebele"}</span><span className="selection-dot" aria-hidden="true">{language === item ? "✓" : ""}</span></button>)}</div></fieldset>
          <fieldset className="level-fieldset"><legend><span className="step-number">02</span> Find your reading level</legend><div className="level-options">{levels.map((item, index) => <button type="button" key={item.id} className={`level-card ${level === item.id ? "selected" : ""}`} aria-pressed={level === item.id} onClick={() => setLevel(item.id)}><span className="level-bars" aria-hidden="true">{"▮".repeat(index + 1)}</span><strong>{item.name}</strong><span>{item.description}</span></button>)}</div></fieldset>
          <Link className="text-link" href={`/library?language=${language}&level=${level}`}>Browse the story library ↗</Link>
        </div>
        <article className="story-preview"><div className="story-top"><span className="eyebrow">YOUR FIRST STORY</span><span aria-hidden="true">↗</span></div><div className="story-art" aria-hidden="true"><span>✳</span><div /></div>{passage ? <><div className="story-meta">{languageName} · {levelName} · {passage.minutes} min · Draft</div><h3>{passage.title}</h3><p>{passage.summary}</p><Link className="primary-button" href={`/read/${passage.id}`}>Start reading <span aria-hidden="true">→</span></Link></> : <><h3>No story available yet.</h3><p>Try another language or level, or browse the library.</p><Link className="primary-button" href="/library">Browse stories <span aria-hidden="true">→</span></Link></>}</article>
      </div>
    </section>
    <section className="journey-strip" aria-label="How it works"><div><span>01 / READ</span><h3>A story to settle into.</h3><p>Everyday moments in the language you choose.</p></div><div><span>02 / DISCOVER</span><h3>A new word to keep.</h3><p>Explore the vocabulary alongside each passage.</p></div><div><span>03 / REFLECT</span><h3>A small step forward.</h3><p>Try a question and see what you understood.</p></div></section>
  </>;
}
