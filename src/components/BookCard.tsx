"use client";

import type { DisplayBook } from "@/lib/types";
import { useLikedBooks } from "@/lib/likes";

export function BookCard({ book }: { book: DisplayBook }) {
  const { isLiked, toggleLike } = useLikedBooks();
  const liked = isLiked(book.id);

  return (
    <li className="flex flex-col gap-2">
      <div className="relative">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="aspect-[2/3] w-full rounded object-cover"
          />
        ) : (
          <div className="flex aspect-[2/3] w-full items-center justify-center rounded border border-line bg-surface text-sm text-ink-muted">
            No cover
          </div>
        )}
        <button
          type="button"
          onClick={() => toggleLike(book)}
          aria-pressed={liked}
          aria-label={liked ? `Unlike ${book.title}` : `Like ${book.title}`}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface/90 text-lg leading-none"
        >
          {liked ? "♥" : "♡"}
        </button>
      </div>
      <h2 className="font-medium text-ink">{book.title}</h2>
      <p className="text-sm text-ink-muted">
        {book.author}
        {book.year ? ` · ${book.year}` : ""}
      </p>
    </li>
  );
}
