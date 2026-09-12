import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-ink">
          Under the covers
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-6">
          <Link href="/" className="text-sm text-ink-muted hover:text-ink">
            Home
          </Link>
          <Link href="/browse" className="text-sm text-ink-muted hover:text-ink">
            Browse
          </Link>
          <Link href="/recommendations" className="text-sm text-ink-muted hover:text-ink">
            Recommendations
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}