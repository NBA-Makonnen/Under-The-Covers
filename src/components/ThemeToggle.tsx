"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  if (!mounted) {
    return <span className="inline-block h-6 w-11" aria-hidden="true" />;
  }

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