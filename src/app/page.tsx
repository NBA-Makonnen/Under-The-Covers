import { getBestsellers } from "@/lib/nyt";

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
          <li key={book.rank} className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              className="aspect-[2/3] w-full rounded object-cover"
            />
            <h2 className="font-medium">{book.title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {book.author}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}