export type Bestseller = {
  rank: number;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  buyUrl: string;
};

export async function getBestsellers(
  list: string = "hardcover-fiction"
): Promise<Bestseller[]> {
  const apiKey = process.env.NYT_BOOKS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing NYT_BOOKS_API_KEY environment variable");
  }

  const res = await fetch(
    `https://api.nytimes.com/svc/books/v3/lists/current/${list}.json?api-key=${apiKey}`,
    { next: { revalidate: 3600 } } // cache for 1 hour
  );

  if (!res.ok) {
    throw new Error(`NYT Books API error: ${res.status}`);
  }

  const data = await res.json();

  return data.results.books.map((book: {
    rank: number;
    title: string;
    author: string;
    description: string;
    book_image: string;
    amazon_product_url: string;
  }) => ({
    rank: book.rank,
    title: book.title,
    author: book.author,
    description: book.description,
    coverImage: book.book_image,
    buyUrl: book.amazon_product_url,
  }));
}