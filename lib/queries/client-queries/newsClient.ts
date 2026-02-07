import { DateFilterMode } from "@/components/DateRangePicker";
import { ArticleType } from "@/lib/types/news-types";

export async function fetchNextCenterNews(): Promise<ArticleType | null> {
  let res: Response;
  res = await fetch(`/api/next-news`);
  console.log("fetchNextCenterNews called", res);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch next news");
  return res.json();
}

export async function fetchNextClassifyingCenterNews(): Promise<{
  news: ArticleType | null;
  isNeverTrained: boolean;
} | null> {
  let res: Response;
  res = await fetch(`/api/next-classifying-news`);
  console.log("fetchNextClassifyingCenterNews called", res);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch next classifying news");
  return res.json();
}

export async function fetchMoreArticles(
  trainingType: "classifying" | "cleaning",
  cursor?: number,
) {
  const res = await fetch(
    `/api/articles?type=${trainingType}&cursor=${cursor}`,
  );

  if (!res.ok) throw new Error("Failed to fetch more articles");

  return res.json();
}

export async function searchNewsClient(params: {
  sourceId?: number;
  fromDate?: Date | null;
  toDate?: Date | null;
  page?: number;
  dateMode?: DateFilterMode;
  url?: string;
}) {
  console.log("searchNewsClient called with params:", params);
  const res = await fetch("/api/news/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceId: params.sourceId,
      fromDate: params.fromDate,
      toDate: params.toDate,
      page: params.page ?? 1,
      dateMode: params.dateMode ?? "All time",
      url: params.url,
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}
