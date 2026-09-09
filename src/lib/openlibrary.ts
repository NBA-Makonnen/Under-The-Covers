export type BookResult = {
  key: string;
  title: string;
  author: string;
  firstPublishYear?: number;
  subjects: string[];
  coverUrl: string | null;
};

type SearchParams = {
  query?: string;
  author?: string;
  subject?: string;
  year?: string;
};

export async function searchBooks({
  query,
  author,
  subject,
  year,
}: SearchParams): Promise<BookResult[]> {
  const terms = [
    query,
    author && `author:"${author}"`,
    subject && `subject:"${subject}"`,
    year && `first_publish_year:${year}`,
  ].filter(Boolean);

  if (terms.length === 0) {
    return [];
  }

  const params = new URLSearchParams({
    q: terms.join(" "),
    limit: "24",
    fields: "key,title,author_name,first_publish_year,subject,cover_i",
  });

    const res = await fetch(`https://openlibrary.org/search.json?${params}`, {
    next: { revalidate: 3600 },
    headers: {
      "User-Agent": "Under-The-Covers/0.1 (bundamulima@gmail.com)",
    },
  });

  if (!res.ok) {
    throw new Error(`Open Library API error: ${res.status}`);
  }

  const data = await res.json();

  return data.docs.map((doc: {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    subject?: string[];
    cover_i?: number;
  }) => ({
    key: doc.key,
    title: doc.title,
    author: doc.author_name?.[0] ?? "Unknown author",
    firstPublishYear: doc.first_publish_year,
    subjects: doc.subject?.slice(0, 3) ?? [],
    coverUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null,
  }));
}