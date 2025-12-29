import ArticleReview from "@/components/article/ArticleReview";
import {
  getArticles,
  getFeedbacks,
  getFilters,
  getOrigins,
  getStatuses,
  getTags,
  getWidth,
} from "@/lib/queries/article";

export const dynamic = "force-dynamic";

export default async function TrainingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: "classifying" | "cleaning";
    activeNews: number;
  }>;
}) {
  const resolvedSearchParams = await searchParams;

  const trainingType = resolvedSearchParams.type ?? "classifying";
  console.log("typeeeee", trainingType);

  const activeNewsId = resolvedSearchParams.activeNews
    ? Number(resolvedSearchParams.activeNews)
    : null;

  const [articles, filters, origins, statuses, tags, initialWidth, feedbacks] =
    await Promise.all([
      getArticles(trainingType),
      getFilters(),
      getOrigins(),
      getStatuses(),
      getTags(),
      getWidth(trainingType),
      activeNewsId ? getFeedbacks(activeNewsId) : Promise.resolve([]),
    ]);

  return (
    <ArticleReview
      key={trainingType}
      articles={articles ?? []}
      categories={filters.categories}
      industries={filters.industries}
      origins={origins.origins}
      statuses={statuses.statuses}
      tags={tags.tags}
      leftWidth={initialWidth.leftWidth}
      rightWidth={initialWidth.rightWidth}
      feedbacks={feedbacks}
    />
  );
}
