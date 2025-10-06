"use client";

import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ArticlesList() {
  const [page, setPage] = useState(1);

  const { data, error, isLoading } = useSWR(
    `/api/articles?page=${page}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  if (error) return <div>Failed to load articles</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {/* Render articles */}
      {data?.articles.map((article: any) => (
        <div key={article.id}>{article.attributes.title}</div>
      ))}

      {/* Pagination */}
      <button
        type="button"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      <button type="button" onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
}
