// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { recordSearchedSubject } from "./interests";

const KEY = "utc:searched-subjects";
const stored = () => JSON.parse(window.localStorage.getItem(KEY) ?? "[]");

describe("recordSearchedSubject", () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Reset the module-level cache by writing a different value first.
    window.localStorage.setItem(KEY, "[]");
    recordSearchedSubject("__reset__");
    window.localStorage.clear();
  });

  it("ignores empty and whitespace-only subjects", () => {
    recordSearchedSubject("");
    recordSearchedSubject("   ");
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  it("trims and stores a subject", () => {
    recordSearchedSubject("  fantasy ");
    expect(stored()).toEqual(["fantasy"]);
  });

  it("puts the newest subject first and removes duplicates", () => {
    recordSearchedSubject("fantasy");
    recordSearchedSubject("romance");
    recordSearchedSubject("fantasy");
    expect(stored()).toEqual(["fantasy", "romance"]);
  });

  it("keeps at most 20 entries, dropping the oldest", () => {
    for (let i = 1; i <= 25; i++) recordSearchedSubject(`subject-${i}`);
    const list = stored();
    expect(list).toHaveLength(20);
    expect(list[0]).toBe("subject-25");
    expect(list).not.toContain("subject-1");
  });

  it("dispatches a change event so subscribers update", () => {
    let fired = 0;
    const handler = () => fired++;
    window.addEventListener("utc:interests-changed", handler);
    recordSearchedSubject("mystery");
    window.removeEventListener("utc:interests-changed", handler);
    expect(fired).toBe(1);
  });
});
