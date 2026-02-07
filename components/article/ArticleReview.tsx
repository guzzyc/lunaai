"use client";

import { definition as Definition } from "@/app/generated/prisma/client";
import {
  feedbackColorMap,
  TRAINING_COLORS,
  TRAINING_COLORS_LIGHT,
} from "@/lib/data/news-data";
import {
  ArticlesArrayType,
  ArticleType,
  TrainedArticleType,
} from "@/lib/types/news-types";
import { formatDate } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  CircleMinus,
  CirclePlus,
  HelpCircle,
  Loader2,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import FeedBackModal from "./FeedBackModal";
import AddCompanyModal from "../company/AddCompanyModal";
import { saveSidebarWidths } from "@/lib/actions/widthActions";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import CleaningFeedBackModal from "./CleaningFeedbackModal";
import { toast } from "sonner";
import { insertCleaningFeedback } from "@/lib/actions/cleaningFeedbackAction";
import { applyTrainingFilters } from "@/lib/actions/trainingCategoryAction";
import Link from "next/link";
import {
  fetchMoreArticles,
  fetchNextCenterNews,
  fetchNextClassifyingCenterNews,
} from "@/lib/queries/client-queries/newsClient";
import { WeeklyTargetProgress } from "@/lib/queries/user";
import { tr } from "zod/v4/locales";
import { Input } from "../ui/input";
import { useSession } from "next-auth/react";

export type NoteType = {
  user: string;
  date: Date | null;
  content: string;
};

interface ArticleReviewProps {
  articles: ArticlesArrayType;
  categories?: Definition[];
  industries?: Definition[];
  countries?: Definition[];
  origins: Definition[];
  statuses: Definition[];
  tags: Definition[];
  leftWidth: Definition;
  rightWidth: Definition;
  // feedbacks: NoteType[];
  weeklyTargetProgress: WeeklyTargetProgress;
}

export default function ArticleReview({
  articles,
  categories,
  industries,
  countries,
  origins,
  statuses,
  tags,
  leftWidth,
  rightWidth,
  // feedbacks,
  weeklyTargetProgress,
}: ArticleReviewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // const [activeArticleId, setActiveArticleId] = useState<number>(
  //   articles[0]?.id
  // );
  // const activeArticleId =
  //   Number(searchParams.get("activeNews")) || articles[0]?.id;

  const { data: session, status } = useSession();
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectedWordCount, setSelectedWordCount] = useState<number>();
  const [allowNext, setAllowNext] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [addCompanyModalOpened, setAddCompanyModalOpened] =
    useState<boolean>(false);
  const [checkedFilters, setCheckedFilters] = useState<Record<string, boolean>>(
    {},
  );
  const [isOtherIndustryChecked, setIsOtherIndustryChecked] = useState(false);
  const [otherIndustryInput, setOtherIndustryInput] = useState("");
  const [otherIndustryOptions, setOtherIndustryOptions] = useState<string[]>(
    [],
  );

  const [showClassifyMenu, setShowClassifyMenu] = useState(false);
  const initialType =
    (searchParams.get("type") as "classifying" | "cleaning") ?? "cleaning";
  const [trainingPageType, setTrainingPageType] = useState<
    "classifying" | "cleaning"
  >(initialType);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [notes, setNotes] = useState<NoteType[]>([]);
  // const [feedbacks, setFeedbacks] = useState<NoteType[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  // const [addingCleaningFeedback, setAddingCleaningFeedback] = useState(false);
  const [addingFeedbackStates, setAddingFeedbackStates] = useState<
    Record<"dislike" | "notsure" | "like", boolean>
  >({
    dislike: false,
    notsure: false,
    like: false,
  });
  const [applyingFilters, setApplyingFilters] = useState(false);
  const [articleColors, setArticleColors] = useState<
    Record<number, { normal: string | null; light: string | null }>
  >({});
  const [leftSidebarWidth, setLeftSidebarWidth] = useState<number>(
    Number(leftWidth?.value ?? "20"),
  );
  const [rightSidebarWidth, setRightSidebarWidth] = useState<number>(
    Number(rightWidth?.value ?? "20"),
  );
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isShowingSelectedNews, setShowingSelectedNews] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftWidthRef = useRef(leftSidebarWidth);
  const rightWidthRef = useRef(rightSidebarWidth);
  const articleListRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const filtersScrollContainerRef = useRef<HTMLDivElement>(null);

  // const centerArticle =
  //   articles.find((a) => a.id === activeArticleId) || articles[0];
  const [articlesList, setArticlesList] = useState<ArticlesArrayType>(articles);
  const [centerArticle, setCenterArticle] = useState<
    ArticleType | TrainedArticleType | null
  >(null);
  const [tempCenterArticle, setTempCenterArticle] =
    useState<ArticleType | null>(null);
  const [isCenterArticleNeverTrained, setIsCenterArticleNeverTrained] = useState(false);

  const [centerArticleType, setCenterArticleType] = useState<
    "trained" | "untrained"
  >("untrained");
  const [loadingNextCenterNews, setLoadingNextCenterNews] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const articlesScrollContainerRef = useRef<HTMLDivElement>(null);

  const [loadingMoreArticles, setLoadingMoreArticles] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const trainingIdMap = useRef<Map<number, number>>(new Map());

  const formattedActiveArticleContent = (
    centerArticle?.rich_content ??
    centerArticle?.content ??
    ""
  ).replace(/\\n/g, "\n");

  useEffect(() => {
    const currentType = searchParams.get("type") ?? "cleanining";

    if (currentType === trainingPageType) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("type", trainingPageType);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    const currentCenterType = searchParams.get("trainedActiveNews")
      ? "trained"
      : "untrained";
    setCenterArticleType(currentCenterType);
  }, [trainingPageType, router, pathname, searchParams]);

  useEffect(() => {
    setLeftSidebarWidth(Number(leftWidth?.value ?? "20"));
    setRightSidebarWidth(Number(rightWidth?.value ?? "20"));

    leftWidthRef.current = Number(leftWidth?.value ?? "20");
    rightWidthRef.current = Number(rightWidth?.value ?? "20");
  }, [leftWidth, rightWidth]);

  // useEffect(() => {
  //   setNotes(feedbacks ?? []);
  // }, [centerArticle, feedbacks]);

  useEffect(() => {
    if (!centerArticle?.id) return;

    let cancelled = false;

    setNotesLoading(true);
    setNotes([]);

    fetch(`/api/feedbacks?articleId=${centerArticle.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setNotes(data ?? []);
      })
      .finally(() => {
        if (!cancelled) setNotesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [centerArticle?.id]);

  // useEffect(() => {
    
  //   if(trainingPageType === "classifying" && centerArticle) {
  //     const isTrained = (centerArticle as TrainedArticleType)?.news_training?.length > 0;
  //     setIsCenterArticleTrained(isTrained);
  //   }
  // }, [trainingPageType, centerArticle?.id]);

  // useEffect(() => {
  //   if (!centerArticle?.id) return;

  //   const params = new URLSearchParams(searchParams.toString());

  //   // remove a stale activeNews
  //   if (params.has("activeNews")) {
  //     params.delete("activeNews");
  //     router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  //   }
  // }, [centerArticle?.id]);

  useEffect(() => {
    if (!centerArticle?.id) return;

    const params = new URLSearchParams(searchParams.toString());
    const current = params.get("activeNews");

    if (current !== String(centerArticle.id)) {
      params.set("activeNews", String(centerArticle.id));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [centerArticle?.id, pathname, router, searchParams]);

  useEffect(() => {
    setArticlesList(articles);
  }, [articles]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingNextCenterNews(true);
      try {
        if (trainingPageType === "classifying") {
          const nextClassifyingNews = await fetchNextClassifyingCenterNews();
          console.log("nextClassifyingNews", nextClassifyingNews);
          setCenterArticle(nextClassifyingNews?.news ?? null);
          setTempCenterArticle(nextClassifyingNews?.news ?? null);
          setIsCenterArticleNeverTrained(nextClassifyingNews?.isNeverTrained ?? false);
        } else {
          const nextNews = await fetchNextCenterNews();
          console.log("nexxxxxxx", nextNews);
          setCenterArticle(nextNews);
          setTempCenterArticle(nextNews);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoadingNextCenterNews(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0) {
        setSelectedRange(selection?.getRangeAt(0));
      }

      // ensure selection is within content area
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setSelectionRect(null);
        setSelectedText("");
        return;
      }
      const cleanedContent =
        centerArticle?.content?.replace(/<[^>]+>/g, "") ?? "";

      const cleanedWordCount = cleanedContent
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

      if (cleanedWordCount < 550) {
        setSelectionRect(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const container = contentRef.current;

      if (!container || !container.contains(range.commonAncestorContainer)) {
        setSelectionRect(null);
        return;
      }

      const rect = range.getBoundingClientRect();

      setSelectionRect(rect);
      const text = selection.toString().trim();
      const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
      setSelectedText(text);
      setSelectedWordCount(wordCount);
      setSelectedText(selection.toString());
    };

    // hide selection tooltip on scroll
    const handleScroll = () => {
      if (selectionRect) {
        setSelectionRect(null);
        window.getSelection()?.removeAllRanges();
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      document.removeEventListener("selectionchange", handleSelection);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [selectionRect, centerArticle]);

  // persist the selection to local state by highlighting
  const handleSelectText = () => {
    if (!selectedRange) return;

    const span = document.createElement("span");
    span.style.backgroundColor = "#BFDBFE";
    span.style.padding = "2px";
    span.className = "selected-highlight";

    selectedRange.surroundContents(span);
    window.getSelection()?.removeAllRanges();
    setSelectionRect(null);
    setAllowNext(true);
  };

  const selectedCategoriesCount = Object.entries(checkedFilters).filter(
    ([key, v]) => v && key.startsWith("Category-"),
  ).length;

  const selectedIndustriesCount = Object.entries(checkedFilters).filter(
    ([key, v]) => v && key.startsWith("Industry-"),
  ).length;

  const toggleFilter = (option: string) => {
    const [type] = option.split("-");

    setCheckedFilters((prev) => {
      const isCurrentlyChecked = !!prev[option];

      const currentCount = Object.entries(prev).filter(
        ([key, v]) => v && key.startsWith(type + "-"),
      ).length;

      // enforce max of 2 selections
      if (!isCurrentlyChecked && currentCount >= 2) {
        toast.info(
          `You can select at most 2 ${type.toLowerCase().replace("y", "i")}es`,
          {
            id: "max-selection-toast",
            richColors: true,
          },
        );
        return prev;
      }

      return {
        ...prev,
        [option]: !isCurrentlyChecked,
      };
    });
  };

  // useEffect(() => {
  //   const colors: Record<
  //     number,
  //     { normal: string | null; light: string | null }
  //   > = {};

  //   articles.forEach((article) => {
  //     const likeValue = article.news_training?.[0]?.like;

  //     if (!likeValue) {
  //       colors[article.id] = { normal: null, light: null };
  //       return;
  //     }

  //     const index = likeValue - 1;
  //     colors[article.id] = {
  //       normal: TRAINING_COLORS[index],
  //       light: TRAINING_COLORS_LIGHT[index],
  //     };
  //   });

  //   if (trainingPageType == "classifying" && centerArticle) {
  //     const centerLikeValue = (centerArticle as TrainedArticleType)
  //       ?.news_training?.[0]?.like;

  //     if (!centerLikeValue) {
  //       colors[centerArticle.id] = { normal: null, light: null };
  //       return;
  //     }
  //     const centerIndex = centerLikeValue - 1;
  //     colors[centerArticle.id] = {
  //       normal: TRAINING_COLORS[centerIndex],
  //       light: TRAINING_COLORS_LIGHT[centerIndex],
  //     };
  //   }

  //   setArticleColors(colors);
  // }, [articles, centerArticle]);

  useEffect(() => {
    const colors: Record<
      number,
      { normal: string | null; light: string | null }
    > = {};

    articlesList.forEach((article) => {
      // Find the news_training with the highest id
      const trainings = article.news_training ?? [];
      const latestTraining = trainings.reduce(
        (max, curr) => (curr.id > (max?.id ?? -Infinity) ? curr : max),
        null as (typeof trainings)[0] | null,
      );
      const likeValue = latestTraining?.like;

      if (!likeValue) {
        colors[article.id] = { normal: null, light: null };
        return;
      }

      const index = likeValue - 1;
      colors[article.id] = {
        normal: TRAINING_COLORS[index],
        light: TRAINING_COLORS_LIGHT[index],
      };
    });

    // if (trainingPageType === "classifying" && centerArticle) {
    //   const centerLikeValue = (centerArticle as TrainedArticleType)
    //     ?.news_training?.[0]?.like;

    //   if (centerLikeValue) {
    //     const centerIndex = centerLikeValue - 1;
    //     colors[centerArticle.id] = {
    //       normal: TRAINING_COLORS[centerIndex],
    //       light: TRAINING_COLORS_LIGHT[centerIndex],
    //     };
    //   }
    // }

    setArticleColors(colors);
  }, [articlesList, centerArticle, trainingPageType]);

  const startResizingLeft = useCallback(() => setIsResizingLeft(true), []);
  const startResizingRight = useCallback(() => setIsResizingRight(true), []);

  const stopResizing = useCallback(async () => {
    if (!isResizingLeft && !isResizingRight) return;

    setIsResizingLeft(false);
    setIsResizingRight(false);

    try {
      await saveSidebarWidths({
        leftWidth: leftWidthRef.current,
        rightWidth: rightWidthRef.current,
        trainingType: trainingPageType,
      });
      console.log(
        "Widths saved accurately:",
        leftWidthRef.current,
        rightWidthRef.current,
      );
    } catch (err) {
      console.error("Save failed:", err);
    }
  }, [isResizingLeft, isResizingRight, trainingPageType]);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const totalWidth = containerRect.width;

      const MIN_PX = 250;
      const MAX_PX = 400;

      if (isResizingLeft) {
        let newPx = e.clientX - containerRect.left;
        newPx = Math.max(MIN_PX, Math.min(MAX_PX, newPx));
        const percent = Math.round((newPx / totalWidth) * 100 * 10) / 10;

        setLeftSidebarWidth(percent);
        leftWidthRef.current = percent;
      }

      if (isResizingRight) {
        let newPx = containerRect.right - e.clientX;
        newPx = Math.max(MIN_PX, Math.min(MAX_PX, newPx));
        const percent = Math.round((newPx / totalWidth) * 100 * 10) / 10;

        setRightSidebarWidth(percent);
        rightWidthRef.current = percent;
      }
    },
    [isResizingLeft, isResizingRight],
  );

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizingLeft, isResizingRight, resize, stopResizing]);

  // prevent text selection when resizing
  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      document.body.classList.add("no-select");
    } else {
      document.body.classList.remove("no-select");
    }

    return () => {
      document.body.classList.remove("no-select");
    };
  }, [isResizingLeft, isResizingRight]);

  useEffect(() => {
    articles.forEach((item: any) => {
      const trainingId = item.news_training?.[0]?.id;
      console.log("trrrrrrr", item);
      if (trainingId) {
        trainingIdMap.current.set(item.id, trainingId);
      }
    });
  }, [articles]);

  const handleCleaningFeedback = async (
    feedbackType: "like" | "dislike" | "notsure",
  ) => {
    setAddingFeedbackStates((prev) => ({ ...prev, [feedbackType]: true }));

    const feedbackMap: Record<typeof feedbackType, number> = {
      dislike: 1,
      notsure: 2,
      like: 3,
    };

    const feedbackNumber = feedbackMap[feedbackType];

    try {
      await insertCleaningFeedback(feedbackNumber, centerArticle?.id as number);
      // toast.success("Feedback added successfully", { richColors: true });
      // setArticlesList(prev => [...prev, centerArticle]);
      if (trainingPageType === "cleaning") {
        shiftNextNews();
      } else {
        setArticleColors((prev) => ({
          ...prev,
          [centerArticle?.id as number]: feedbackColorMap[feedbackType],
        }));
      }
    } catch (err) {
      toast.error("Failed to add feedback", { richColors: true });
      console.log("errrrrr", err);
    } finally {
      setAddingFeedbackStates((prev) => ({ ...prev, [feedbackType]: false }));
      setShowFeedbackModal(false);
      setIsCenterArticleNeverTrained(false);
    }
  };

  const shiftNextNews = async () => {
    setLoadingNextCenterNews(true);
    try {
      if (trainingPageType === "classifying") {
        const nextClassifyingNews = await fetchNextClassifyingCenterNews();
        if (!nextClassifyingNews?.news) {
          handleSetActiveNews(centerArticle?.id as number);
          setCenterArticle(null);
          return;
        }
        setCenterArticle(nextClassifyingNews.news);
        setTempCenterArticle(nextClassifyingNews.news);
        setIsCenterArticleNeverTrained(nextClassifyingNews.isNeverTrained);
        handleSetActiveNews(nextClassifyingNews.news.id);
        scrollFiltersToTop();
        scrollContentsToTop();
        scrollNewsListToTop();
        return;
      }

      const nextNews = await fetchNextCenterNews();
      if (!nextNews) {
        handleSetActiveNews(centerArticle?.id as number);
        setCenterArticle(null);
        return;
      }
      setCenterArticle(nextNews);
      setTempCenterArticle(nextNews);
      handleSetActiveNews(nextNews.id);
      scrollFiltersToTop();
      scrollContentsToTop();
      scrollNewsListToTop();
    } catch (error) {
      console.log("center news error", error);
    } finally {
      setLoadingNextCenterNews(false);
    }
  };

  const handleApplyFilters = async () => {
    const cleanedContent =
      centerArticle?.content?.replace(/<[^>]+>/g, "") ?? "";

    const wordCount = cleanedContent.trim().split(/\s+/).filter(Boolean).length;

    if ((!selectedRange || !allowNext) && wordCount > 550) {
      toast.info("Please make text selection from the news", {
        richColors: true,
      });
      return;
    }
    if (isCenterArticleNeverTrained) {
      toast.info("Please make a selection from the feedbacks", {
        richColors: true,
        position:"bottom-center"
      });
      return;
    }
    setApplyingFilters(true);
    const filterIds: string[] = Object.entries(checkedFilters)
      .filter(([, checked]) => checked)
      .map(([key]) => key.split("-")[1])
      .filter(Boolean);

    const otherIndustries = isOtherIndustryChecked
      ? otherIndustryInput
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];

    const finalFilters = [...filterIds, ...otherIndustries];

    try {
      await applyTrainingFilters(finalFilters, centerArticle?.id as number);
      shiftNextNews();
      // toast.success("Filters applied successfully", { richColors: true });
      setCheckedFilters({});
      setIsOtherIndustryChecked(false);
      if (filtersScrollContainerRef.current) {
        filtersScrollContainerRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } catch (error) {
      // toast.error("Failed to apply filters", { richColors: true });
    } finally {
      setApplyingFilters(false);
    }
  };

  const scrollFiltersToTop = () => {
    if (!filtersScrollContainerRef.current) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        filtersScrollContainerRef.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    });
  };

  const scrollContentsToTop = () => {
    if (!scrollContainerRef.current) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    });
  };

  const scrollNewsListToTop = () => {
    if (!articlesScrollContainerRef.current) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        articlesScrollContainerRef.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    });
  };

  useEffect(() => {
    const element = articleListRefs.current.get(centerArticle?.id as number);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [centerArticle?.id as number]);

  // useEffect(() => {
  //   if (!articles || articles.length === 0) return;

  //   if (searchParams.get("activeNews")) return;

  //   const firstId = articles[0].id;

  //   router.replace(
  //     `${pathname}?${searchParams.toString()}&activeNews=${firstId}`,
  //     { scroll: false },
  //   );
  // }, [articles, searchParams, pathname, router]);

  useEffect(() => {
    console.log("temppppppp", tempCenterArticle);
  }, [tempCenterArticle]);

  useEffect(() => {
    if (trainingPageType !== "classifying") return;

    const training = (centerArticle as TrainedArticleType)?.news_training;
    const categoryString =
      training && training.length > 0 ? (training[0].category ?? "") : "";

    if (!categoryString) {
      setCheckedFilters({});
      setOtherIndustryOptions([]);
      return;
    }

    const hydrated: Record<string, boolean> = {};
    let otherIndustries: string[] = [];

    const categoryIds = new Set(categories?.map((c) => String(c.id)) ?? []);
    const industryIds = new Set(industries?.map((i) => String(i.id)) ?? []);
    const countryIds = new Set(countries?.map((i) => String(i.id)) ?? []);

    categoryString.split(",").forEach((id) => {
      const cleanId = id.trim();
      if (!cleanId) return;

      if (categoryIds.has(cleanId)) {
        hydrated[`Category-${cleanId}`] = true;
      } else if (industryIds.has(cleanId)) {
        hydrated[`Industry-${cleanId}`] = true;
      } else if (countryIds.has(cleanId)) {
        hydrated[`Country-${cleanId}`] = true;
      } else {
        otherIndustries.push(cleanId);
      }
    });

    setOtherIndustryOptions(otherIndustries);
    setCheckedFilters(hydrated);
  }, [centerArticle, trainingPageType, categories, industries]);

  // load more articles with infinite scroll
  useEffect(() => {
    const container = articlesScrollContainerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      if (loadingMoreArticles || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollTop + clientHeight >= scrollHeight - 50) {
        // near bottom
        setLoadingMoreArticles(true);

        try {
          const lastArticle = articlesList[articlesList.length - 1];
          if (!lastArticle) {
            setLoadingMoreArticles(false);
            return;
          }
          const cursor = trainingIdMap.current.get(lastArticle.id);
          console.log("currrrr", trainingIdMap);
          const more = await fetchMoreArticles(trainingPageType, cursor);

          if (!more || more.length === 0) {
            setHasMore(false);
            return;
          }
          // if (!more || more.length < 3) {
          //   setHasMore(false);
          // }

          more.forEach((item: any) => {
            if (item.news_training?.[0]?.id) {
              trainingIdMap.current.set(item.id, item.news_training[0].id);
            }
          });

          setArticlesList((prev) => {
            const existing = new Set(prev.map((p) => p.id));
            const filtered = more.filter((m: any) => !existing.has(m.id));
            return [...prev, ...filtered];
          });
        } catch (err) {
          console.error("Failed to load more articles", err);
        } finally {
          setLoadingMoreArticles(false);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [articlesList, loadingMoreArticles, hasMore, trainingPageType]);

  const handleSetActiveNews = (articleId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("activeNews", articleId.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClickTrainedNews = (article: TrainedArticleType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("activeNews", article.id.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setCenterArticle(article);
    setShowingSelectedNews(true);
    setIsCenterArticleNeverTrained(false);
  };

  const handleContinueClicked = () => {
    if (!tempCenterArticle) {
      setCenterArticle(null);
      setShowingSelectedNews(false);
      removeActiveNewsUrl();
      return;
    }

    setCenterArticle(tempCenterArticle);
    handleSetActiveNews(tempCenterArticle.id);
    scrollFiltersToTop();
    scrollContentsToTop();
    scrollNewsListToTop();
    setShowingSelectedNews(false);
    removeActiveNewsUrl();
  };

  const removeActiveNewsUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("activeNews");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const hasAtLeastOneCategoryAndIndustry = (() => {
    const entries = Object.entries(checkedFilters).filter(([, v]) => v);

    const hasCategory = entries.some(([key]) => key.startsWith("Category-"));
    const hasIndustry = entries.some(([key]) => key.startsWith("Industry-"));
    const hasCountry = entries.some(([key]) => key.startsWith("Country-"));
    const hasOtherIndustry =
      isOtherIndustryChecked && otherIndustryInput.trim().length > 0;

    return (
      hasCategory &&
      hasCountry &&
      (hasIndustry || hasOtherIndustry || otherIndustryOptions.length > 0)
    );
  })();

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-white">
      {/* toolbar */}
      <div className="h-11 border-b-2 border-border-dark bg-white flex items-center justify-between pl-6 shrink-0 z-20">
        <div
          className="relative border-r-2 border-border-dark h-full flex items-center"
          style={{
            width: `calc(${leftSidebarWidth}% - 19px)`,
            // minWidth: 226,
            // maxWidth: 376,
          }}
        >
          <button
            onClick={() => setShowClassifyMenu(!showClassifyMenu)}
            className="flex items-center gap-4 font-semibold text-subtitle-dark text-xs hover:bg-neutral-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full justify-between"
          >
            <div className="flex items-center gap-2">
              {/* <Rows2 size={16} /> */}
              <Image
                src="/icons/classify.svg"
                alt="Luna logo"
                width={13}
                height={11}
                className="flex items-center p-0 m-0 "
              />
              <span className="capitalize">{trainingPageType}</span>
            </div>
            <ChevronDown
              size={16}
              className={` text-icon-dark transition-transform mr-2 ${
                showClassifyMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {showClassifyMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowClassifyMenu(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-1 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {["Classifying", "Cleaning"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setTrainingPageType(
                        status.toLocaleLowerCase() as
                          | "classifying"
                          | "cleaning",
                      );
                      setShowClassifyMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 transition-colors ${
                      status.toLocaleLowerCase() === trainingPageType
                        ? "font-medium text-blue-600 bg-blue-50"
                        : "text-subtitle-dark"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Button
              variant="outline"
              size="sm"
              className="flex gap-2 items-center cursor-pointer rounded-lg h-7"
            >
              {/* <Globe size={14} className="text-subtitle-dark/80" /> */}
              <Link
                target="_blank"
                href={centerArticle?.url ?? ""}
                className="text-xs text-subtitle-dark font-semibold"
              >
                Go web
              </Link>
            </Button>
            <Button
              size="sm"
              className="flex gap-2 items-center cursor-pointer rounded-lg h-7"
              onClick={() => setAddCompanyModalOpened(true)}
            >
              <Plus size={14} className="" />
              <span className="text-xs font-semibold">Add company</span>
            </Button>
          </div>

          <div className="flex items-center">
            <div className="h-11 w-[1.5px] bg-neutral-200 mx-[7.5px]"></div>
            <div className="flex items-center gap-2 px-4">
              <div className="w-14.5 mx-1 h-1.5 bg-neutral-300 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${
                      weeklyTargetProgress.totalTargets
                        ? (weeklyTargetProgress.completedTargets! /
                            weeklyTargetProgress.totalTargets) *
                          100
                        : 0
                    }%`,
                  }}
                  className="h-full bg-blue-600 rounded-full"
                ></div>
              </div>
              <div className="flex items-center text-xs font-semibold tracking-wide">
                <span className="text-neutral-600">
                  {weeklyTargetProgress.completedTargets ?? 0}
                </span>
                <span className="text-neutral-900/40">
                  /{weeklyTargetProgress.totalTargets ?? 0}
                </span>
              </div>
            </div>
            {/* <div className="h-11 w-[1.5px] bg-neutral-200 mx-[7.5px]"></div>
            <div className="flex items-center text-subtitle-dark text-xs font-semibold gap-1 px-1">
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer p-1 h-5"
              >
                <CircleMinus size={14} />
              </Button>
              <span>100%</span>
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer p-1 h-5"
              >
                <CirclePlus size={14} />
              </Button>
            </div> */}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* article list */}
        <aside
          className="border-r-2 border-border-dark bg-white flex flex-col shrink-0 relative"
          style={{
            width: `${leftSidebarWidth}%`,
            // minWidth: 250,
            // maxWidth: 400,
          }}
        >
          <div
            className="flex-1 overflow-y-auto py-4 space-y-5 scrollbar-custom "
            ref={articlesScrollContainerRef}
          >
            {articlesList && articlesList.length > 0 ? (
              articlesList.map((article, idx) => {
                const colorClass = articleColors[article.id]?.normal ?? "";

                console.log("left color", colorClass);
                const formattedContent =
                  article?.content?.replace(/\\n/g, "\n") ?? "";

                return (
                  <div
                    key={trainingIdMap.current.get(article.id) ?? article.id}
                    ref={(el) => {
                      if (el) articleListRefs.current.set(article.id, el);
                      else articleListRefs.current.delete(article.id);
                    }}
                    className="flex flex-col items-center gap-2 scroll-mt-2 relative"
                  >
                    <div
                      onClick={() => handleClickTrainedNews(article)}
                      className={`
                  pt-2 pb-3 px-2 rounded-2xl border-3 cursor-pointer transition-all duration-200 hover:shadow-sm relative group bg-white shadow-xs min-w-[153px] w-[78%]
                  ${colorClass}
                `}
                    >
                      <h3 className="font-bold text-xs mb-2 text-neutral-900 font-poppins leading-[140%] tracking-[0] line-clamp-5">
                        {article.header}
                      </h3>
                      <p className="text-xs text-neutral-900 line-clamp-8 leading-relaxed font-poppins">
                        {formattedContent}
                      </p>

                      <div className="absolute -right-2 -bottom-2 text-xs rounded-lg bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-[10px] font-bold text-neutral-600 w-fit px-2 py-[3px]">
                        {article?.id}
                      </div>
                    </div>
                    {/* <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-neutral-900">
                      {articlesList.length - idx}
                    </div> */}
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center text-subtitle-dark">
                No news availale
              </div>
            )}
            {loadingMoreArticles && (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin size-4 text-neutral-500" />
              </div>
            )}
          </div>
          {/* left sidebar resizer */}
          <div
            className="absolute -right-3 top-5 z-20 cursor-grab group/handle"
            onMouseDown={startResizingLeft}
          >
            <div className="w-6 h-6 bg-white border border-neutral-200 rounded-full shadow-sm flex items-center justify-center group-hover/handle:border-blue-400 group-hover/handle:ring-2 group-hover/handle:ring-blue-100 transition-all">
              {/* <UnfoldHorizontal className="w-4 h-4 text-subtitle-dark/80 group-hover/handle:text-blue-500" /> */}
              <Image
                src="/icons/resizer.svg"
                alt="Luna logo"
                width={14}
                height={14}
                className="flex items-center p-0 m-0 pointer-events-none"
                priority
              />
            </div>
          </div>

          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/0 transition-colors z-10"
            onMouseDown={startResizingLeft}
          />
        </aside>

        {/* article content */}
        {centerArticle && centerArticle.id ? (
          <section
            ref={scrollContainerRef}
            className="flex-1 bg-bg-main overflow-y-auto relative flex justify-center scroll-smooth scrollbar-custom"
          >
            <div
              className={`my-6 rounded-3xl border-6 shadow-sm h-fit w-[93%] ${
                isCenterArticleNeverTrained ? "border-yellow-500/50" : articleColors[centerArticle.id]?.light ?? ""}`}
            >
              <div
                className={`bg-white min-h-full p-12 shadow-sm relative border-x rounded-[18px] border ${
                  isCenterArticleNeverTrained ? "border-yellow-500" : articleColors[centerArticle.id]?.normal ?? ""
                }`}
              >
                <div className="text-title-red font-bold text-sm tracking-wider uppercase px-2 py-1 mb-2 rounded w-fit ml-auto">
                  {centerArticle?.company_news?.[0]?.company?.name || "-"}
                </div>

                <div className="mb-6 mt-2">
                  <h1 className="text-xl font-bold text-title-dark mb-4 leading-tight">
                    {centerArticle.header}
                  </h1>
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-2 text-sm text-neutral-500">
                    <span className="font-bold text-subtitle-dark text-sm">
                      {centerArticle?.news_source?.name ?? "Unknown Source"}
                    </span>
                    {/* <span className="w-1.5 h-1.5 rounded-full bg-neutral-300"></span>
                    <span className="text-subtitle-dark font-medium text-sm">
                      {centerArticle.author || "Unknown author"}
                    </span> */}
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 "></span>
                    <span className="text-subtitle-dark font-medium text-sm">
                      {formatDate(centerArticle.published_date)}
                    </span>
                  </div>
                </div>

                <div ref={contentRef}>
                  <div className="prose prose-sm max-w-none text-title-dark/90 text-sm leading-8 selection:bg-blue-100 selection:text-blue-900 whitespace-pre-wrap">
                    {formattedActiveArticleContent ?? ""}
                  </div>
                  <div className="text-subtitle-dark/80 text-sm text-end mt-4 font-semibold">
                    {centerArticle.id}
                  </div>
                </div>
              </div>
            </div>

            {/* text selection popover */}
            {selectionRect && (
              <div
                className="fixed z-100 bg-white text-title-dark shadow-xl px-3 py-1.5 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-gray-300 rounded-md"
                style={{
                  top: `${selectionRect.top - 48}px`,
                  left: `${selectionRect.left + selectionRect.width / 2}px`,
                  transform: "translateX(-50%)",
                }}
              >
                <span className="text-xs font-semibold font-mono">
                  {selectedWordCount ?? 0}
                </span>
                <div className="h-3 w-px bg-neutral-400"></div>
                <button
                  onClick={handleSelectText}
                  className="text-xs font-bold text-blue-500 hover:text-blue-700 cursor-pointer"
                >
                  Select
                </button>

                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
              </div>
            )}
          </section>
        ) : loadingNextCenterNews ? (
          <div className="flex-1 bg-bg-main overflow-y-auto relative flex justify-center scroll-smooth scrollbar-custom items-center text-subtitle-dark">
            <Loader2 className="animate-spin size-5" />
          </div>
        ) : (
          <div className="flex-1 bg-bg-main overflow-y-auto relative flex justify-center scroll-smooth scrollbar-custom items-center text-subtitle-dark">
            {trainingPageType == "cleaning" ? (
              <span>No news</span>
            ) : (
              <span>No clean news</span>
            )}
          </div>
        )}

        {/* filters */}
        <aside
          className="border-l-2 border-border-dark bg-white flex flex-col shrink-0 relative"
          style={{
            width: `${rightSidebarWidth}%`,
            // minWidth: 232.5,
            // maxWidth: 400,
          }}
        >
          <div
            className="flex-1 overflow-y-auto pt-6 pb-4 space-y-4 scrollbar-custom flex flex-col"
            ref={filtersScrollContainerRef}
          >
            {trainingPageType === "classifying" && centerArticle && (
              <div className="space-y-6">
                <div className="px-4 border-b-2 border-border-dark pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-subtitle-dark text-sm tracking-wide">
                      Country
                    </h3>
                    {/* <HelpCircle className="w-4 h-4 text-neutral-400 cursor-help" /> */}
                  </div>
                  <div className="space-y-3">
                    {countries?.map((option, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 cursor-pointer group select-none"
                      >
                        <div
                          className={`
                          w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-all duration-200
                          ${
                            checkedFilters[`Country-${option.id}`]
                              ? "bg-checkbox-bg"
                              : "border-gray-300 group-hover:border-blue-400"
                          }
                        `}
                        >
                          {checkedFilters[`Country-${option.id}`] && (
                            <Check
                              className="w-3.5 h-3.5 text-white"
                              strokeWidth={3}
                            />
                          )}
                          <input
                            type="checkbox"
                            className="hidden"
                            onChange={() =>
                              toggleFilter(`Country-${option.id}`)
                            }
                            checked={!!checkedFilters[`Country-${option.id}`]}
                          />
                        </div>
                        <span
                          className={`text-sm transition-colors ${
                            checkedFilters[`Country-${option.id}`]
                              ? "text-subtitle-dark font-medium"
                              : "text-neutral-600 group-hover:text-subtitle-dark"
                          }`}
                        >
                          {option.value}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="px-4 border-b-2 border-border-dark pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-subtitle-dark text-sm tracking-wide">
                      Category
                    </h3>
                    {/* <HelpCircle className="w-4 h-4 text-neutral-400 cursor-help" /> */}
                  </div>
                  <div className="space-y-3">
                    {categories?.map((option, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 cursor-pointer group select-none"
                      >
                        <div
                          className={`
                          w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-all duration-200
                          ${
                            checkedFilters[`Category-${option.id}`]
                              ? "bg-checkbox-bg"
                              : "border-gray-300 group-hover:border-blue-400"
                          }
                        `}
                        >
                          {checkedFilters[`Category-${option.id}`] && (
                            <Check
                              className="w-3.5 h-3.5 text-white"
                              strokeWidth={3}
                            />
                          )}
                          <input
                            type="checkbox"
                            className="hidden"
                            onChange={() =>
                              toggleFilter(`Category-${option.id}`)
                            }
                            checked={!!checkedFilters[`Category-${option.id}`]}
                          />
                        </div>
                        <span
                          className={`text-sm transition-colors ${
                            checkedFilters[`Category-${option.id}`]
                              ? "text-subtitle-dark font-medium"
                              : "text-neutral-600 group-hover:text-subtitle-dark"
                          }`}
                        >
                          {option.value}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="px-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-subtitle-dark text-sm tracking-wide">
                      Industry
                    </h3>
                    {/* <HelpCircle className="w-4 h-4 text-neutral-400 cursor-help" /> */}
                  </div>
                  <div className="space-y-3">
                    {industries?.map((option, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 cursor-pointer group select-none"
                      >
                        <div
                          className={`
                          w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-all duration-200
                          ${
                            checkedFilters[`Industry-${option.id}`]
                              ? "bg-checkbox-bg"
                              : "border-gray-300 group-hover:border-blue-400"
                          }
                        `}
                        >
                          {checkedFilters[`Industry-${option.id}`] && (
                            <Check
                              className="w-3.5 h-3.5 text-white"
                              strokeWidth={3}
                            />
                          )}
                          <input
                            type="checkbox"
                            className="hidden"
                            onChange={() =>
                              toggleFilter(`Industry-${option.id}`)
                            }
                            checked={!!checkedFilters[`Industry-${option.id}`]}
                          />
                        </div>
                        <span
                          className={`text-sm transition-colors truncate ${
                            checkedFilters[`Industry-${option.id}`]
                              ? "text-subtitle-dark font-medium"
                              : "text-neutral-600 group-hover:text-subtitle-dark"
                          }`}
                        >
                          {option.value}
                        </span>
                      </label>
                    ))}
                    {otherIndustryOptions.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-2">
                          {otherIndustryOptions.map((industry, i) => (
                            <label
                              key={i}
                              className="flex items-center gap-3 cursor-pointer group select-none"
                            >
                              <div
                                className={`
                          w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-all duration-200
                          ${"bg-checkbox-bg"}
                        `}
                              >
                                <Check
                                  className="w-3.5 h-3.5 text-white"
                                  strokeWidth={3}
                                />
                                <input
                                  readOnly
                                  type="checkbox"
                                  className="hidden"
                                  checked
                                />
                              </div>
                              <span
                                className={`text-sm transition-colors truncate ${"text-subtitle-dark font-medium"}`}
                              >
                                {industry}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Other industry option */}
                    <label className="flex items-start gap-3 cursor-pointer group select-none">
                      <div
                        className={`
                        w-5 h-5 mt-1 shrink-0 rounded border flex items-center justify-center transition-all duration-200
                        ${
                          isOtherIndustryChecked
                            ? "bg-checkbox-bg"
                            : "border-gray-300 group-hover:border-blue-400"
                        }
                      `}
                        onClick={() =>
                          setIsOtherIndustryChecked((prev) => !prev)
                        }
                      >
                        {isOtherIndustryChecked && (
                          <Check
                            className="w-3.5 h-3.5 text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>

                      <div className="flex flex-col gap-2 w-full mt-[3px]">
                        <span
                          className={`text-sm transition-colors ${
                            isOtherIndustryChecked
                              ? "text-subtitle-dark font-medium"
                              : "text-neutral-600 group-hover:text-subtitle-dark"
                          }`}
                          onClick={() =>
                            setIsOtherIndustryChecked((prev) => !prev)
                          }
                        >
                          Other
                        </span>

                        {isOtherIndustryChecked && (
                          <Input
                            type="text"
                            placeholder="e.g. Fintech, AgriTech, Deep Tech"
                            value={otherIndustryInput}
                            onChange={(e) =>
                              setOtherIndustryInput(e.target.value)
                            }
                            className="w-full border rounded-md px-3 py-1.5 text-sm outline-none"
                          />
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="px-4 pt-4 space-y-6 mt-auto">
              {trainingPageType === "classifying" && (
                <Button
                  onClick={handleApplyFilters}
                  variant="outline"
                  size="sm"
                  disabled={!hasAtLeastOneCategoryAndIndustry}
                  className="flex items-center gap-2 rounded-full w-full text-subtitle-dark text-xs font-bold cursor-pointer"
                >
                  {applyingFilters && (
                    <Loader2 className="animate-spin size-4" />
                  )}
                  Next
                </Button>
              )}

              <div className="flex flex-col gap-3 justify-between mb-4">
                {notesLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin size-4 text-neutral-500" />
                  </div>
                ) : notes?.length === 0 ? (
                  <p className="text-neutral-500 text-sm text-center">-</p>
                ) : (
                  <>
                    <h3 className="font-bold text-subtitle-dark text-sm tracking-wide">
                      Notes
                    </h3>
                    <ul className="space-y-2">
                      {notes.map((note, i) => (
                        <li
                          key={i}
                          className="p-3 rounded-md border bg-neutral-50 text-xs text-neutral-800"
                        >
                          <div className="flexi items-center mb-1">
                            <span className="text-subtitle-dark/80 font-medium text-xs">
                              {formatDate(note.date) ?? "Unknown date"} -
                            </span>
                            <span className="font-medium text-subtitle-dark/80">
                              {" "}
                              {note.user}
                            </span>
                          </div>
                          {note.content}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {/* <HelpCircle className="w-4 h-4 text-neutral-400 cursor-help" /> */}
              </div>

              <Button
                onClick={() => setShowFeedbackModal(true)}
                variant="outline"
                className="text-subtitle-dark flex gap-2 mx-auto w-full rounded-full cursor-pointer mt-auto"
              >
                <Image
                  src="/icons/feedback.svg"
                  alt="Luna logo"
                  width={14}
                  height={14}
                  className="flex items-center p-0 m-0 "
                />
                <span className="text-sm font-semibold">Feedback</span>
                {/* <div className="rounded-full bg-red-600 text-[10px] text-white px-2 py-1 flex items-center justify-center leading-normal">
                  145
                </div> */}
              </Button>
            </div>
          </div>

          {/* right sidebar resizer */}
          <div
            className="absolute -left-3 top-5 z-20 cursor-grab group/handle"
            onMouseDown={startResizingRight}
          >
            <div className="w-6 h-6 bg-white border border-neutral-200 rounded-full shadow-sm flex items-center justify-center group-hover/handle:border-blue-400 group-hover/handle:ring-2 group-hover/handle:ring-blue-100 transition-all">
              {/* <UnfoldHorizontal className="w-4 h-4 text-subtitle-dark/80 group-hover/handle:text-blue-500" /> */}
              <Image
                src="/icons/resizer.svg"
                alt="Luna logo"
                width={14}
                height={14}
                className="flex items-center p-0 m-0 pointer-events-none"
                priority
              />
            </div>
          </div>

          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/0 transition-colors z-10"
            onMouseDown={startResizingRight}
          />
        </aside>

        {showFeedbackModal && (
          <FeedBackModal
            closeModal={() => setShowFeedbackModal(false)}
            pageType={trainingPageType}
            newsId={centerArticle?.id as number}
            onAddFeedback={(content) => {
              setNotes((prev) => [
                ...prev,
                {
                  user: session?.user.name ?? "Current User",
                  date: new Date(),
                  content,
                },
              ]);
            }}
            onlike={() => handleCleaningFeedback("like")}
            onDislike={() => handleCleaningFeedback("dislike")}
            onNotSure={() => handleCleaningFeedback("notsure")}
            addingFeedbackStates={addingFeedbackStates}
          />
        )}

        {isShowingSelectedNews && (
          <div className="absolute bottom-8 right-1/2 left-1/2 ml-56">
            <Button
              variant="outline"
              className="drop-shadow-2xl rounded-full cursor-pointer"
              size="md"
              onClick={handleContinueClicked}
            >
              Continue
            </Button>
          </div>
        )}
      </div>

      {/* Add company dialog */}
      <AddCompanyModal
        open={addCompanyModalOpened}
        onClose={() => setAddCompanyModalOpened(false)}
        onDelete={() => {}}
        statuses={statuses}
        origins={origins}
        tags={tags}
        activeNewsUrl={centerArticle?.url ?? ""}
      />

      {/* cleaning feedback modal */}
      {trainingPageType === "cleaning" && centerArticle && (
        <CleaningFeedBackModal
          addingFeedbackStates={addingFeedbackStates}
          onlike={() => handleCleaningFeedback("like")}
          onDislike={() => handleCleaningFeedback("dislike")}
          onNotSure={() => handleCleaningFeedback("notsure")}
        />
      )}
    </div>
  );
}
