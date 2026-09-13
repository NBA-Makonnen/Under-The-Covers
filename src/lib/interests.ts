"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "utc:searched-subjects";
const MAX_ENTRIES = 20;
const CHANGE_EVENT = "utc:interests-changed";

let cachedRaw: string | null = null;
let cachedSubjects: string[] = [];

function readSearchedSubjects(): string[] {
  if (typeof window === "undefined") return cachedSubjects;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedSubjects = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      cachedSubjects = [];
    }
  }

  return cachedSubjects;
}

export function recordSearchedSubject(subject: string) {
  if (typeof window === "undefined" || !subject.trim()) return;
  const trimmed = subject.trim();
  const existing = readSearchedSubjects();
  const next = [trimmed, ...existing.filter((s) => s !== trimmed)].slice(
    0,
    MAX_ENTRIES
  );
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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

const EMPTY_SUBJECTS: string[] = [];

function getServerSnapshot(): string[] {
  return EMPTY_SUBJECTS;
}

export function useSearchedSubjects() {
  return useSyncExternalStore(subscribe, readSearchedSubjects, getServerSnapshot);
}
