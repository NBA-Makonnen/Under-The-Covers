"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { DisplayBook } from "./types";

export type LikedBook = Pick<DisplayBook, "id" | "title" | "author" | "subjects">;

const STORAGE_KEY = "utc:liked-books";
const CHANGE_EVENT = "utc:likes-changed";

let cachedRaw: string | null = null;
let cachedBooks: LikedBook[] = [];

function readLikedBooks(): LikedBook[] {
  if (typeof window === "undefined") return cachedBooks;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedBooks = raw ? (JSON.parse(raw) as LikedBook[]) : [];
    } catch {
      cachedBooks = [];
    }
  }

  return cachedBooks;
}

function writeLikedBooks(books: LikedBook[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore storage errors (e.g. private browsing with storage disabled)
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): LikedBook[] {
  return [];
}

export function useLikedBooks() {
  const likedBooks = useSyncExternalStore(
    subscribe,
    readLikedBooks,
    getServerSnapshot
  );

  const isLiked = useCallback(
    (id: string) => likedBooks.some((b) => b.id === id),
    [likedBooks]
  );

  const toggleLike = useCallback((book: DisplayBook) => {
    const current = readLikedBooks();
    const already = current.some((b) => b.id === book.id);
    const next = already
      ? current.filter((b) => b.id !== book.id)
      : [
          ...current,
          {
            id: book.id,
            title: book.title,
            author: book.author,
            subjects: book.subjects,
          },
        ];
    writeLikedBooks(next);
  }, []);

  return { likedBooks, isLiked, toggleLike };
}
