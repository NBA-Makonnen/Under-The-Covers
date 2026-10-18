import { describe, expect, it } from "vitest";
import { fromBestseller, fromBookResult } from "./types";
import type { Bestseller } from "./nyt";
import type { BookResult } from "./openlibrary";

const bestseller: Bestseller = {
  rank: 3,
  title: "THE WITCH",
  author: "Freida McFadden",
  description: "A thriller.",
  coverImage: "https://example.com/witch.jpg",
  buyLinks: [{ name: "Amazon", url: "https://example.com/amazon" }],
};

const bookResult: BookResult = {
  key: "/works/OL123W",
  title: "Credence",
  author: "Penelope Douglas",
  firstPublishYear: 2020,
  subjects: ["romance"],
  coverUrl: "https://covers.openlibrary.org/b/id/1-M.jpg",
};

describe("fromBestseller", () => {
  it("maps fields and passes the NYT buy links through", () => {
    const book = fromBestseller(bestseller);
    expect(book.id).toBe("nyt-3-THE WITCH");
    expect(book.title).toBe("THE WITCH");
    expect(book.coverUrl).toBe("https://example.com/witch.jpg");
    expect(book.buyLinks).toEqual(bestseller.buyLinks);
  });

  it("uses null when there is no cover image", () => {
    expect(fromBestseller({ ...bestseller, coverImage: "" }).coverUrl).toBeNull();
  });
});

describe("fromBookResult", () => {
  it("uses the Open Library key as the id and keeps year and subjects", () => {
    const book = fromBookResult(bookResult);
    expect(book.id).toBe("/works/OL123W");
    expect(book.year).toBe(2020);
    expect(book.subjects).toEqual(["romance"]);
  });

  it("builds an Open Library link plus three retailer search links", () => {
    const links = fromBookResult(bookResult).buyLinks ?? [];
    expect(links.map((l) => l.name)).toEqual([
      "Open Library",
      "Amazon",
      "Bookshop.org",
      "Google",
    ]);
    expect(links[0].url).toBe("https://openlibrary.org/works/OL123W");
  });

  it("URL-encodes the title and author in search links", () => {
    const links =
      fromBookResult({
        ...bookResult,
        title: "Fire & Blood",
        author: "George R.R. Martin",
      }).buyLinks ?? [];
    const amazon = links.find((l) => l.name === "Amazon");
    expect(amazon?.url).toContain("Fire%20%26%20Blood%20George%20R.R.%20Martin");
    expect(amazon?.url).not.toContain("&%20");
  });
});
