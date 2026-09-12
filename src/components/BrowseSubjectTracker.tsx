"use client";

import { useEffect } from "react";
import { recordSearchedSubject } from "@/lib/interests";

export function BrowseSubjectTracker({ subject }: { subject: string }) {
  useEffect(() => {
    if (subject) {
      recordSearchedSubject(subject);
    }
  }, [subject]);

  return null;
}
