import Link from "next/link";

export default function StoryNotFound() {
  return <section className="library-empty missing-story"><p className="eyebrow">STORY NOT FOUND</p><h1>We couldn’t find that story.</h1><p>It may have moved, or the link may be incorrect.</p><Link className="text-link" href="/library">Browse the library ↗</Link></section>;
}
