"use client";

import { useCallback, useSyncExternalStore } from "react";

// The beforeInteractive theme-init script in layout.tsx runs correctly
// during SSR, but React 19 warns about any <script> tag rendered through a
// component tree, without distinguishing that from a script that will
// genuinely never run — a known false positive with Next.js 16.2+/Turbopack
// (see https://github.com/shadcn-ui/ui/issues/10104). Dev-only, and only
// this one specific message is filtered.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="relative inline-flex h-6 w-11 items-center rounded-full border border-line bg-surface transition-colors motion-reduce:transition-none"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-brand transition-transform motion-reduce:transition-none ${
          isDark ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
