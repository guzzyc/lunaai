import ArticleReview from "@/components/article/ArticleReview";
import NewsSearch from "@/components/article/NewsSearch";
import {
  getArticles,
  getFeedbacks,
  getFilters,
  getOrigins,
  getStatuses,
  getTags,
  getWidth,
} from "@/lib/queries/article";
import { geteNewsSources } from "@/lib/queries/definition";
import { getNextActiveSource } from "@/lib/queries/user";

export const dynamic = "force-dynamic";

export default async function NewsSearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: "classifying" | "cleaning";
    activeNews: number;
    trainedActiveNews: number;
  }>;
}) {
  const resolvedSearchParams = await searchParams;

  const trainingType = resolvedSearchParams.type ?? "classifying";
  console.log("typeeeee", trainingType);

  const activeNewsId = resolvedSearchParams.activeNews
    ? Number(resolvedSearchParams.activeNews)
    : null;

  const [articles, filters, origins, statuses, tags, feedbacks, newsSourceData] =
    await Promise.all([
      getArticles(trainingType),
      getFilters(),
      getOrigins(),
      getStatuses(),
      getTags(),
      activeNewsId ? getFeedbacks(activeNewsId) : Promise.resolve([]),
      geteNewsSources(),
    ]);

  return (
    <NewsSearch
      key={trainingType}
      articles={articles ?? []}
      categories={filters.categories}
      industries={filters.industries}
      origins={origins.origins}
      statuses={statuses.statuses}
      tags={tags.tags}
      // feedbacks={feedbacks}
      newsSourcesOptions={newsSourceData}
    />
  );
}