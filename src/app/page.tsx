import { getBestsellers } from "@/lib/nyt";
import { BookCard } from "@/components/BookCard";
import { fromBestseller } from "@/lib/types";

export default async function Home() {
  const books = await getBestsellers();

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Under The Covers</h1>
          <a href="/browse" className="mt-2 text-sm underline text-zinc-600 dark:text-zinc-400">
              Browse &amp; filter →
          </a>
      <p className="mt-4 max-w-md text-center text-zinc-600 dark:text-zinc-400">
        Discover what&apos;s popular right now, filter by genre, year, or
        author, and get recommendations based on what you like.
      </p>

      <ul className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {books.map((book) => (
          <BookCard key={book.rank} book={fromBestseller(book)} />
        ))}
      </ul>
    </main>
  );
}
