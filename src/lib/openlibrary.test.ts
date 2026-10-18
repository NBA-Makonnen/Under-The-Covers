import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OpenLibraryError, searchBooks } from "./openlibrary";

const okResponse = (docs: unknown[]) => ({
  ok: true,
  status: 200,
  json: async () => ({ docs }),
});

const errorResponse = (status: number) => ({
  ok: false,
  status,
  json: async () => ({}),
});

describe("searchBooks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("returns an empty list without calling fetch when no filters are given", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await searchBooks({})).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("combines the filters into one query and sends a User-Agent", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    await searchBooks({
      query: "credence",
      author: "Douglas",
      subject: "romance",
      year: "2020",
    });

    const [url, options] = fetchMock.mock.calls[0];
    const q = new URL(url).searchParams.get("q");
    expect(q).toBe(
      'credence author:"Douglas" subject:"romance" first_publish_year:2020'
    );
    expect(options.headers["User-Agent"]).toContain("Under-The-Covers");
  });

  it("maps documents into book results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        okResponse([
          {
            key: "/works/OL1W",
            title: "Credence",
            author_name: ["Penelope Douglas"],
            first_publish_year: 2020,
            subject: ["a", "b", "c", "d"],
            cover_i: 42,
          },
          { key: "/works/OL2W", title: "No extras" },
        ])
      )
    );

    const [first, second] = await searchBooks({ query: "x" });

    expect(first.author).toBe("Penelope Douglas");
    expect(first.subjects).toEqual(["a", "b", "c"]);
    expect(first.coverUrl).toBe("https://covers.openlibrary.org/b/id/42-M.jpg");
    expect(second.author).toBe("Unknown author");
    expect(second.coverUrl).toBeNull();
    expect(second.subjects).toEqual([]);
  });

  it("retries once after a network error and then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("ETIMEDOUT"))
      .mockResolvedValueOnce(okResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    const promise = searchBooks({ query: "x" });
    await vi.advanceTimersByTimeAsync(500);

    expect(await promise).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries once after a 5xx response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(503))
      .mockResolvedValueOnce(okResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    const promise = searchBooks({ query: "x" });
    await vi.advanceTimersByTimeAsync(500);

    expect(await promise).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry a 4xx response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(errorResponse(404));
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchBooks({ query: "x" })).rejects.toBeInstanceOf(
      OpenLibraryError
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws OpenLibraryError when both attempts fail", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("ETIMEDOUT"));
    vi.stubGlobal("fetch", fetchMock);

    const promise = searchBooks({ query: "x" });
    const assertion = expect(promise).rejects.toBeInstanceOf(OpenLibraryError);
    await vi.advanceTimersByTimeAsync(500);
    await assertion;

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
