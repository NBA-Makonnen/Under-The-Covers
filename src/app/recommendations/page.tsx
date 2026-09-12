"use client";

import { useEffect, useState } from "react";
import { BookCard } from "@/components/BookCard";
import { useLikedBooks } from "@/lib/likes";
import { useSearchedSubjects } from "@/lib/interests";
import { fromBookResult } from "@/lib/types";
import type { BookResult } from "@/lib/openlibrary";

export default function RecommendationsPage() {
  const { likedBooks } = useLikedBooks();
  const searchedSubjects = useSearchedSubjects();
  const [books, setBooks] = useState<BookResult[]>([]);
  const [subject, setSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const likedSubjects = likedBooks.flatMap((b) => b.subjects ?? []);
  const allSubjects = [...likedSubjects, ...searchedSubjects];
  const hasSignal = allSubjects.length > 0;
  const subjectsKey = allSubjects.join(",");
  const excludeKey = likedBooks.map((b) => b.id).join(",");

  useEffect(() => {
    if (!hasSignal) {
      return;
    }

    let cancelled = false;
    // Standard loading-flag-before-fetch pattern, not a sync external-store
    // read like the cases above — no useSyncExternalStore equivalent applies.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const params = new URLSearchParams({
      subjects: subjectsKey,
      exclude: excludeKey,
    });

    fetch(`/api/recommendations?${params}`)
      .then((res) => res.json())
      .then((data: { subject: string | null; books: BookResult[] }) => {
        if (cancelled) return;
        setSubject(data.subject);
        setBooks(data.books);
      })
      .catch(() => {
        if (!cancelled) {
          setSubject(null);
          setBooks([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hasSignal, subjectsKey, excludeKey]);

  const status = !hasSignal
    ? "empty"
    : loading
    ? "loading"
    : books.length > 0
    ? "ready"
    : "empty";

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        Recommended for you
      </h1>

      {status === "loading" && (
        <p className="mt-8 text-ink-muted">Finding books for you…</p>
      )}

      {status === "empty" && (
        <p className="mt-8 max-w-md text-center text-ink-muted">
          Like a few books or search by genre on the Browse page, and
          recommendations will show up here based on what you&apos;re into.
        </p>
      )}

      {status === "ready" && subject && (
        <p className="mt-2 text-sm text-ink-muted">
          Based on your interest in {subject}
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
