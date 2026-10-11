"use client";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className="library-empty missing-story" role="alert">
    <p className="eyebrow">STORIES UNAVAILABLE</p>
    <h1>We couldn’t load the stories.</h1>
    <p>Check your connection and try again.</p>
    <button className="text-link" type="button" onClick={() => retry()}>Try again ↗</button>
  </section>;
}
