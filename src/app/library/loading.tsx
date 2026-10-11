export default function Loading() {
  return <section className="library-section" role="status" aria-live="polite">
    <div className="library-heading"><p className="eyebrow">THE STORY LIBRARY</p><h1>Opening the library…</h1></div>
    <div className="library-loading" aria-hidden="true"><span /><span /><span /></div>
  </section>;
}
