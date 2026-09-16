import type { Bestseller, BuyLink } from "./nyt";
import type { BookResult } from "./openlibrary";

export type DisplayBook = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  year?: number;
  subjects?: string[];
  buyLinks?: BuyLink[];
};

export function fromBestseller(book: Bestseller): DisplayBook {
  return {
    id: `nyt-${book.rank}-${book.title}`,
    title: book.title,
    author: book.author,
    coverUrl: book.coverImage || null,
    buyLinks: book.buyLinks,
  };
}

export function fromBookResult(book: BookResult): DisplayBook {
  return {
    id: book.key,
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl,
    year: book.firstPublishYear,
    subjects: book.subjects,
  };
}
