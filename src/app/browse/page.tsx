import { searchBooks, type BookResult } from "@/lib/openlibrary";
import { BookCard } from "@/components/BookCard";
import { BrowseSubjectTracker } from "@/components/BrowseSubjectTracker";
import { fromBookResult } from "@/lib/types";

export default async function Browse({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const author = typeof params.author === "string" ? params.author : "";
  const subject = typeof params.subject === "string" ? params.subject : "";
  const year = typeof params.year === "string" ? params.year : "";

  const hasFilters = query || author || subject || year;
  let books: BookResult[] = [];
  let failed = false;
  if (hasFilters) {
    try {
      books = await searchBooks({ query, author, subject, year });
    } catch {
      failed = true;
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <BrowseSubjectTracker subject={subject} />
      <h1 className="text-3xl font-semibold tracking-tight">Browse</h1>

      <form className="mt-8 flex w-full max-w-2xl flex-wrap gap-3" method="GET">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by title or keyword"
          className="flex-1 rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-brand"
        />
        <input
          type="text"
          name="author"
          defaultValue={author}
          placeholder="Author"
          className="rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-brand"
        />
        <input
          type="text"
          name="subject"
          defaultValue={subject}
          placeholder="Genre / subject"
          className="rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-brand"
        />
        <input
          type="number"
          name="year"
          defaultValue={year}
          placeholder="Year"
          className="w-28 rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-brand"
        />
        <button
          type="submit"
          className="rounded bg-brand px-4 py-2 text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Search
        </button>
      </form>

      {failed && (
        <p className="mt-8 text-ink-muted" role="alert">
          Couldn&apos;t reach Open Library right now. Please try again in a
          moment.
        </p>
      )}

      {hasFilters && !failed && books.length === 0 && (
        <p className="mt-8 text-ink-muted">
          No results. Try different filters.
        </p>
      )}

      <ul className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {books.map((book) => (
          <BookCard key={book.key} book={fromBookResult(book)} />
        ))}
      </ul>
    </main>
  );
}
