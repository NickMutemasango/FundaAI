import type { Metadata } from "next";
import Link from "next/link";
import ApiStatus from "@/components/ApiStatus";
import "./globals.css";
export const metadata: Metadata = { title: "FundaAI", description: "Explore reading in Shona and Zimbabwean Ndebele, one story at a time." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="site-shell">
    <header>
      <Link className="brand" href="/" aria-label="FundaAI home"><span className="brand-mark" aria-hidden="true">F</span>FundaAI</Link>
      <nav className="site-nav" aria-label="Main navigation"><Link href="/">Home</Link><Link href="/library">Stories</Link></nav>
      <span className="preview-pill">● Early preview</span>
    </header>
    <main>{children}</main>
    <footer><span className="footer-brand">FundaAI</span><p>Made for the joy of reading.</p><ApiStatus /><span>Prototype · Sample language content awaits fluent-speaker review.<br />AI tutoring, accounts, and saved progress are coming later.</span></footer>
  </div></body></html>;
}

