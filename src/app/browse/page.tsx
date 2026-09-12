import { searchBooks } from "@/lib/openlibrary";
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
  const books = hasFilters
    ? await searchBooks({ query, author, subject, year })
    : [];

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
          className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          type="text"
          name="author"
          defaultValue={author}
          placeholder="Author"
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          type="text"
          name="subject"
          defaultValue={subject}
          placeholder="Genre / subject"
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          type="number"
          name="year"
          defaultValue={year}
          placeholder="Year"
          className="w-28 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-white dark:bg-white dark:text-zinc-900"
        >
          Search
        </button>
      </form>

      {hasFilters && books.length === 0 && (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">
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
