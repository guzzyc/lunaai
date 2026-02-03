import { DateFilterMode } from "@/components/DateRangePicker";
import { ArticleType } from "@/lib/types/news-types";


export async function fetchNextCenterNews(trainingType: "classifying" | "cleaning" = "cleaning"): Promise<ArticleType | null> {

  let res:Response 
  if(trainingType == "cleaning"){
    res = await fetch(`/api/next-news`);
  }
  else{
    res = await fetch(`/api/next-classifying-news`);
  }
  console.log("fetchNextCenterNews called", res);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch next news");
  return res.json();
}

export async function fetchMoreArticles(
  trainingType: "classifying" | "cleaning",
  cursor?: number
) {
  const res = await fetch(
    `/api/articles?type=${trainingType}&cursor=${cursor}`
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
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

