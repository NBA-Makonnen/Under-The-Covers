import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import * as openlibrary from "@/lib/openlibrary";

vi.mock("@/lib/openlibrary", () => ({
  searchBooks: vi.fn(),
}));

const searchBooks = vi.mocked(openlibrary.searchBooks);

const book = (key: string) => ({
  key,
  title: key,
  author: "A",
  subjects: [],
  coverUrl: null,
});

function call(query: string) {
  return GET(new NextRequest(`http://localhost/api/recommendations?${query}`));
}

describe("GET /api/recommendations", () => {
  beforeEach(() => {
    searchBooks.mockReset();
  });

  it("returns nothing and skips Open Library when there are no subjects", async () => {
    const res = await call("");
    expect(await res.json()).toEqual({ subject: null, books: [] });
    expect(searchBooks).not.toHaveBeenCalled();
  });

  it("searches by the most frequent subject, ignoring case and spacing", async () => {
    searchBooks.mockResolvedValue([]);
    await call("subjects=Fantasy, romance,fantasy ,FANTASY,romance");
    expect(searchBooks).toHaveBeenCalledWith({ subject: "fantasy" });
  });

  it("removes books the user already liked", async () => {
    searchBooks.mockResolvedValue([book("/works/1"), book("/works/2")]);
    const res = await call("subjects=fantasy&exclude=/works/1");
    const data = await res.json();
    expect(data.subject).toBe("fantasy");
    expect(data.books.map((b: { key: string }) => b.key)).toEqual(["/works/2"]);
  });

  it("returns 502 with an empty list when Open Library fails", async () => {
    searchBooks.mockRejectedValue(new Error("down"));
    const res = await call("subjects=fantasy");
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ subject: null, books: [] });
  });
});
