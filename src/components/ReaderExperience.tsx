"use client";

import { useState } from "react";
import Link from "next/link";
import type { Passage } from "@/types/passage";

export default function ReaderExperience({ passage }: { passage: Passage }) {
  const [word, setWord] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const languageName = passage.language === "shona" ? "Shona" : "Ndebele";
  const backHref = `/library?language=${passage.language}&level=${passage.level}`;

  return <section className="reading-section">
    <Link className="back-button" href={backHref}>← Back to stories</Link>
    <div className="reading-heading"><p className="eyebrow">{languageName.toUpperCase()} / {passage.level.toUpperCase()} / {passage.minutes} MIN READ / DRAFT</p><h1>{passage.title}</h1><p>{passage.summary}</p></div>
    <div className="reader-grid">
      <article className="passage-paper" aria-label="Reading passage" lang={passage.language === "shona" ? "sn" : "nd"}>{passage.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<span className="end-mark" aria-hidden="true">✳</span></article>
      <div className="reading-tools">
        <aside className="vocabulary-panel"><p className="eyebrow">A FEW WORDS TO KNOW</p><h2>Build your vocabulary.</h2><p>Choose a word for its English meaning.</p><div className="word-buttons">{passage.vocabulary.map((item) => <button key={item.word} type="button" aria-pressed={word === item.word} onClick={() => setWord(item.word)}>{item.word}</button>)}</div><div className="word-definition" aria-live="polite">{word ? <><strong>{word}</strong><p>{passage.vocabulary.find((item) => item.word === word)?.meaning}</p></> : <p>Your next new word is waiting.</p>}</div><p className="small-note">Sample definitions, awaiting fluent-speaker review.</p></aside>
        <aside className="chat-preview"><p className="eyebrow">ASK ABOUT THE STORY</p><h2>Reading help is coming.</h2><p>Questions about this passage will be available after the AI tutor is built and reviewed for both languages.</p><label htmlFor="chat-question">Your question</label><textarea id="chat-question" rows={2} placeholder="Ask about a word or idea…" disabled /><button type="button" disabled>Ask question</button></aside>
      </div>
    </div>
    {!quizOpen ? <div className="quiz-start"><div><p className="eyebrow">PAUSE & REFLECT</p><h2>Ready to check what you understood?</h2><p>One practice question. Take your time.</p></div><button className="primary-button" type="button" onClick={() => setQuizOpen(true)}>Start quiz <span aria-hidden="true">→</span></button></div> :
      <section className="quiz-panel" id="quiz"><div><p className="eyebrow">PAUSE & REFLECT</p><h2>What did you discover?</h2><p>One practice question. Take your time.</p></div><form onSubmit={(event) => { event.preventDefault(); if (answer !== null) setSubmitted(true); }}><fieldset><legend>{passage.question.prompt}</legend>{passage.question.options.map((option, index) => <label className={`answer-option ${answer === index ? "chosen" : ""}`} key={option}><input type="radio" name="answer" checked={answer === index} disabled={submitted} onChange={() => setAnswer(index)} required />{option}</label>)}</fieldset>{!submitted ? <button className="primary-button" type="submit" disabled={answer === null}>Check my answer →</button> : <div className="quiz-feedback" role="status"><strong>{answer === passage.question.correctIndex ? "That’s right. Well read!" : "Let’s take another look."}</strong><p>{passage.question.explanation}</p><button type="button" className="text-link" onClick={() => { setAnswer(null); setSubmitted(false); }}>Try again ↗</button></div>}</form></section>}
  </section>;
}
