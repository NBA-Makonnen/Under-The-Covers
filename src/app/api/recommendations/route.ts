import { NextRequest, NextResponse } from "next/server";
import { searchBooks, type BookResult } from "@/lib/openlibrary";

function pickTopSubject(subjects: string[]): string | null {
  const counts = new Map<string, number>();

  for (const raw of subjects) {
    const key = raw.trim().toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  let top: string | null = null;
  let topCount = 0;
  for (const [key, count] of counts) {
    if (count > topCount) {
      top = key;
      topCount = count;
    }
  }

  return top;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subjectsParam = searchParams.get("subjects") ?? "";
  const excludeParam = searchParams.get("exclude") ?? "";

  const subjects = subjectsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const exclude = new Set(
    excludeParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

  const topSubject = pickTopSubject(subjects);

  if (!topSubject) {
    return NextResponse.json({ subject: null, books: [] });
  }

  let results: BookResult[];
  try {
    results = await searchBooks({ subject: topSubject });
  } catch {
    return NextResponse.json({ subject: null, books: [] }, { status: 502 });
  }
  const books = results.filter((book) => !exclude.has(book.key));

  return NextResponse.json({ subject: topSubject, books });
}
