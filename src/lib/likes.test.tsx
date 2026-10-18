// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLikedBooks } from "./likes";
import type { DisplayBook } from "./types";

const KEY = "utc:liked-books";

const book = (id: string, subjects?: string[]): DisplayBook => ({
  id,
  title: `Title ${id}`,
  author: "Author",
  coverUrl: null,
  subjects,
});

describe("useLikedBooks", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty", () => {
    const { result } = renderHook(() => useLikedBooks());
    expect(result.current.likedBooks).toEqual([]);
    expect(result.current.isLiked("a")).toBe(false);
  });

  it("likes a book and persists only the fields it needs", () => {
    const { result } = renderHook(() => useLikedBooks());

    act(() => result.current.toggleLike({ ...book("a", ["fantasy"]), year: 2020 }));

    expect(result.current.isLiked("a")).toBe(true);
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    expect(saved).toEqual([
      { id: "a", title: "Title a", author: "Author", subjects: ["fantasy"] },
    ]);
  });

  it("unlikes a book when toggled twice", () => {
    const { result } = renderHook(() => useLikedBooks());

    act(() => result.current.toggleLike(book("a")));
    act(() => result.current.toggleLike(book("a")));

    expect(result.current.isLiked("a")).toBe(false);
    expect(result.current.likedBooks).toEqual([]);
  });

  it("keeps other liked books when one is removed", () => {
    const { result } = renderHook(() => useLikedBooks());

    act(() => result.current.toggleLike(book("a")));
    act(() => result.current.toggleLike(book("b")));
    act(() => result.current.toggleLike(book("a")));

    expect(result.current.likedBooks.map((b) => b.id)).toEqual(["b"]);
  });

  it("recovers from corrupt stored data", () => {
    window.localStorage.setItem(KEY, "{not json");
    const { result } = renderHook(() => useLikedBooks());
    expect(result.current.likedBooks).toEqual([]);
  });
});
