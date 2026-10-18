import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getBestsellers } from "./nyt";

function mockFetch(body: unknown, ok = true, status = 200) {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("getBestsellers", () => {
  beforeEach(() => {
    vi.stubEnv("NYT_BOOKS_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("throws when the API key is missing", async () => {
    vi.stubEnv("NYT_BOOKS_API_KEY", "");
    await expect(getBestsellers()).rejects.toThrow("Missing NYT_BOOKS_API_KEY");
  });

  it("throws when the NYT API responds with an error", async () => {
    mockFetch({}, false, 429);
    await expect(getBestsellers()).rejects.toThrow("429");
  });

  it("maps books and keeps buy_links as buyLinks", async () => {
    const fetchMock = mockFetch({
      results: {
        books: [
          {
            rank: 1,
            title: "A",
            author: "Someone",
            description: "d",
            book_image: "https://example.com/a.jpg",
            buy_links: [{ name: "Amazon", url: "https://example.com" }],
          },
        ],
      },
    });

    const [book] = await getBestsellers("hardcover-fiction");

    expect(fetchMock.mock.calls[0][0]).toContain("hardcover-fiction.json");
    expect(book.coverImage).toBe("https://example.com/a.jpg");
    expect(book.buyLinks).toEqual([
      { name: "Amazon", url: "https://example.com" },
    ]);
  });

  it("falls back to an empty buyLinks array when buy_links is missing", async () => {
    mockFetch({
      results: {
        books: [
          { rank: 1, title: "A", author: "B", description: "", book_image: "" },
        ],
      },
    });
    const [book] = await getBestsellers();
    expect(book.buyLinks).toEqual([]);
  });
});
