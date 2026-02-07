"use client";

import { definition as Definition } from "@/app/generated/prisma/client";
import { insertCleaningFeedback } from "@/lib/actions/cleaningFeedbackAction";
import { applyTrainingFilters } from "@/lib/actions/trainingCategoryAction";
// import { saveSidebarWidths } from "@/lib/actions/widthActions";
import {
  feedbackColorMap,
  TRAINING_COLORS,
  TRAINING_COLORS_LIGHT,
} from "@/lib/data/news-data";
import {
  fetchMoreArticles,
  fetchNextCenterNews,
  searchNewsClient,
} from "@/lib/queries/client-queries/newsClient";
import {
  ArticlesArrayType,
  ArticleType,
  NewsSourceType,
  TrainedArticleType,
} from "@/lib/types/news-types";
import { cn, formatDate } from "@/lib/utils";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronsUpDown,
  CircleQuestionMark,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AddCompanyModal from "../company/AddCompanyModal";
import { Button } from "../ui/button";
import CleaningFeedBackModal from "./CleaningFeedbackModal";
import FeedBackModal from "./FeedBackModal";
import NewsSearchTable from "./NewsSearchList";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { DateFilterMode, DateRange, DateRangePicker } from "../DateRangePicker";
import { format } from "date-fns";

export interface FilterState {
  source: NewsSourceType | null;
  dateMode: DateFilterMode;
  dateRange: DateRange;
}

interface NewsSearchProps {
  articles: ArticlesArrayType;
  categories?: Definition[];
  industries?: Definition[];
  origins: Definition[];
  statuses: Definition[];
  tags: Definition[];
  // feedbacks: string[];
  newsSourcesOptions: NewsSourceType[];
}

export default function NewsSearch({
  articles,
  // feedbacks,
  origins,
  statuses,
  tags,
  newsSourcesOptions,
}: NewsSearchProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlQuery = searchParams.get("url");
  const [urlConsumed, setUrlConsumed] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  // const [notes, setNotes] = useState<string[]>(feedbacks ?? []);
  const [isSourceSelectorOpen, setSourceSelectorOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filter, setFilter] = useState<FilterState>({
    source: null,
    dateMode: "All time",
    dateRange: {},
  });

  const [leftSidebarWidth, setLeftSidebarWidth] = useState<number>(
    Number("40"),
  );
  const [rightSidebarWidth, setRightSidebarWidth] = useState<number>(
    Number("20"),
  );
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [addCompanyModalOpened, setAddCompanyModalOpened] =
    useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftWidthRef = useRef(leftSidebarWidth);
  const rightWidthRef = useRef(rightSidebarWidth);

  const [articlesList, setArticlesList] = useState<ArticlesArrayType>(articles);
  const [selectedArticle, setSelectedArticle] = useState<ArticleType | null>(
    null,
  );

  const [loadingNextCenterNews, setLoadingNextCenterNews] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  const formattedActiveArticleContent = (
    selectedArticle?.rich_content ??
    selectedArticle?.content ??
    ""
  ).replace(/\\n/g, "\n");

  const getDateRangeLabel = () => {
    if (filter.dateMode === "All time") return "All time";
    if (filter.dateMode === "Is empty") return "Is empty";
    if (
      filter.dateMode === "Between" &&
      filter.dateRange.start &&
      filter.dateRange.end
    ) {
      return `${format(filter.dateRange.start, "MMM d")} - ${format(filter.dateRange.end, "MMM d, yyyy")}`;
    }
    if (filter.dateRange.start) {
      return `${filter.dateMode} ${format(filter.dateRange.start, "MMM d, yyyy")}`;
    }
    return "All time";
  };

  // useEffect(() => {
  //   setLeftSidebarWidth(Number(leftWidth?.value ?? "20"));
  //   setRightSidebarWidth(Number(rightWidth?.value ?? "20"));

  //   leftWidthRef.current = Number(leftWidth?.value ?? "20");
  //   rightWidthRef.current = Number(rightWidth?.value ?? "20");
  // }, [leftWidth, rightWidth]);

  // useEffect(() => {
  //   setNotes(feedbacks ?? []);
  // }, [feedbacks]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current) {
      setArticlesList(articles);
      didInitRef.current = true;
    }
  }, [articles]);

  const startResizingLeft = useCallback(() => setIsResizingLeft(true), []);
  const startResizingRight = useCallback(() => setIsResizingRight(true), []);

  const stopResizing = useCallback(async () => {
    if (!isResizingLeft && !isResizingRight) return;

    setIsResizingLeft(false);
    setIsResizingRight(false);

    // try {
    //   await saveSidebarWidths({
    //     leftWidth: leftWidthRef.current,
    //     rightWidth: rightWidthRef.current,
    //     trainingType: trainingPageType,
    //   });
    //   console.log(
    //     "Widths saved accurately:",
    //     leftWidthRef.current,
    //     rightWidthRef.current,
    //   );
    // } catch (err) {
    //   console.error("Save failed:", err);
    // }
  }, [isResizingLeft, isResizingRight]);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const totalWidth = containerRect.width;

      const MIN_PX = 370;
      const MAX_PX = 700;

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

  // search news
  useEffect(() => {
    const applyFilters = async () => {
      const requestId = ++requestIdRef.current;

      const getDateParams = () => {
        switch (filter.dateMode) {
          case "On":
            return {
              fromDate: filter.dateRange.start,
              toDate: filter.dateRange.start,
            };

          case "Before":
            return {
              fromDate: undefined,
              toDate: filter.dateRange.start,
            };

          case "After":
            return {
              fromDate: filter.dateRange.start,
              toDate: undefined,
            };

          case "Between":
            return {
              fromDate: filter.dateRange.start,
              toDate: filter.dateRange.end,
            };

          case "Is empty":
            return {
              fromDate: null,
              toDate: null,
            };

          case "All time":
          default:
            return {
              fromDate: undefined,
              toDate: undefined,
            };
        }
      };

      setIsFiltering(true);
      try {
        const { fromDate, toDate } = getDateParams();
        const res = await searchNewsClient({
          sourceId: filter.source?.id,
          fromDate,
          toDate,
          page,
          dateMode: filter.dateMode,
          url: urlQuery ?? undefined,
        });

        if (requestId !== requestIdRef.current) return;

        setArticlesList(res.data);
        setTotalPages(res.totalPages);
        setTotalCount(res.totalCount);
        setSelectedArticle(null);
        scrollContentsToTop();

        if (urlQuery && !urlConsumed) {
          setUrlConsumed(true);
          router.replace(pathname); // removes ?url=...
        }
      } catch (e) {
        console.log("Error applying filters:", e);
        if (requestId === requestIdRef.current) {
          toast.error("Failed to apply filters");
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsFiltering(false);
        }
      }
    };

    applyFilters();
  }, [filter, page, urlQuery]);

  const handleSelectNews = (news: ArticleType) => {
    setSelectedArticle(news);
    scrollContentsToTop();
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-white">
      {/* toolbar */}
      {/* <div className="h-11 border-b-2 border-border-dark bg-white flex items-center justify-between pl-6 shrink-0 z-20">
        <div
          className="relative border-r-2 border-border-dark h-full flex items-center"
          style={{
            width: `calc(${leftSidebarWidth}% - 19px)`,
          }}
        >
          <div className="w-full">
            <Popover
              open={isSourceSelectorOpen}
              onOpenChange={setSourceSelectorOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="md"
                  role="combobox"
                  className="w-full justify-between text-sm font-normal"
                >
                  {selectedSource ? (
                    <span>
                      {selectedSource.name}
                    </span>
                  ) : (
                    <span className="text-subtitle-dark">Select source</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-sm" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0 z-[1000] min-w-[250px]">
                <Command>
                  <CommandInput placeholder="Search source..." />
                  <CommandEmpty>No user found.</CommandEmpty>

                  <CommandGroup>
                    {newsSourcesOptions.map((source) => (
                      <CommandItem
                        key={source.id}
                        value={source.name}
                        onSelect={() => {
                          setSelectedSource(source);
                          setSourceSelectorOpen(false);
                        }}
                        className="text-subtitle-dark font-medium"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSource?.id === source.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {source.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Button
              variant="outline"
              size="sm"
              className="flex gap-2 items-center cursor-pointer rounded-lg h-7"
            >
              <Link
                target="_blank"
                href={selectedArticle?.url ?? ""}
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
        </div>
      </div> */}

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
          {/* filters */}
          <div className="relative flex items-center px-8 pt-4 pb-2 w-full gap-2 flex-wrap">
            {filter.source && filter.dateRange && (
              <button
                className="bg-gray-100 p-2 rounded-sm cursor-pointer hover:bg-gray-200"
                onClick={() =>
                  setFilter({
                    ...filter,
                    source: null,
                    dateMode: "All time",
                    dateRange: {},
                  })
                }
              >
                <X size={14} />
              </button>
            )}
            {/* source selector */}
            <div className="max-w-fit">
              <Popover
                open={isSourceSelectorOpen}
                onOpenChange={setSourceSelectorOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="md"
                    role="combobox"
                    className="w-full justify-between text-sm font-normal"
                  >
                    {filter.source ? (
                      <span className="text-subtitle-dark font-medium">
                        {filter.source.name}
                      </span>
                    ) : (
                      <span className="text-subtitle-dark font-medium">
                        Select source
                      </span>
                    )}
                    {isFiltering ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-sm" />
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0 z-[1000] min-w-[250px]">
                  <Command>
                    <CommandInput placeholder="Search source..." />
                    <CommandEmpty>No sources found.</CommandEmpty>

                    <CommandGroup>
                      {newsSourcesOptions.map((source) => (
                        <CommandItem
                          key={source.id}
                          value={source.name}
                          onSelect={() => {
                            setFilter((prev) => ({ ...prev, source }));
                            setSourceSelectorOpen(false);
                          }}
                          className="text-subtitle-dark font-medium"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filter.source?.id === source.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {source.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* date selector */}
            <div className="relative" ref={datePickerRef}>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`h-10 flex items-center space-x-2 px-3 border rounded-lg text-sm transition-all ${showDatePicker || filter.dateMode !== "All time" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"}`}
              >
                <Calendar
                  className={`w-4 h-4 ${showDatePicker || filter.dateMode !== "All time" ? "text-blue-500" : "text-gray-400"}`}
                />
                <span className="text-xs font-medium opacity-80 tracking-widest mr-1">
                  Date range :
                </span>
                <span className="font-medium text-xs">
                  {getDateRangeLabel()}
                </span>
                {isFiltering ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : filter.dateMode !== "All time" ? (
                  <X
                    className="w-3.5 h-3.5 ml-1 hover:text-blue-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilter((p) => ({
                        ...p,
                        dateMode: "All time",
                        dateRange: {},
                      }));
                      setShowDatePicker(false);
                    }}
                  />
                ) : (
                  <ChevronDown
                    className={`w-4 h-4 opacity-40 transition-transform ${showDatePicker ? "rotate-180" : ""}`}
                  />
                )}
              </button>
              {showDatePicker && (
                <DateRangePicker
                  currentMode={filter.dateMode}
                  currentRange={filter.dateRange}
                  onApply={(mode, range) => {
                    setFilter((prev) => ({
                      ...prev,
                      dateMode: mode,
                      dateRange: range,
                    }));
                    setShowDatePicker(false);
                  }}
                  onClose={() => setShowDatePicker(false)}
                />
              )}
            </div>
          </div>
          <NewsSearchTable
            data={articlesList}
            onSelect={handleSelectNews}
            selectedData={selectedArticle}
            loading={isFiltering}
          />

          {/* news pagination */}
          {/* <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
              </PaginationItem>

              {[1, 2, 3].map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={page === p}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext onClick={() => setPage((p) => p + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination> */}

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem className="cursor-pointer">
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {(() => {
                  const pages = new Set<number>();

                  // always show first & last
                  pages.add(1);
                  pages.add(totalPages);

                  // show current ±1
                  for (let p = page - 1; p <= page + 1; p++) {
                    if (p > 1 && p < totalPages) pages.add(p);
                  }

                  const sortedPages = Array.from(pages).sort((a, b) => a - b);

                  let lastPage = 0;

                  return sortedPages.map((p) => {
                    const items: React.ReactNode[] = [];

                    if (p - lastPage > 1) {
                      items.push(
                        <PaginationItem
                          className="cursor-pointer"
                          key={`ellipsis-${p}`}
                        >
                          <PaginationEllipsis />
                        </PaginationItem>,
                      );
                    }

                    items.push(
                      <PaginationItem key={p} className="cursor-pointer">
                        <PaginationLink
                          isActive={page === p}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>,
                    );

                    lastPage = p;
                    return items;
                  });
                })()}

                <PaginationItem className="cursor-pointer">
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          {/* 
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={page === 1}
                  onClick={() => page > 1 && setPage(page - 1)}
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink isActive>{page}</PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  aria-disabled={page >= totalPages}
                  onClick={() => page < totalPages && setPage(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination> */}

          <div
            className="absolute -right-3 top-3 z-20 cursor-grab group/handle"
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
        <div className="flex flex-col w-full">
          {/* toolbar */}
          <div className="flex items-center gap-2 h-11 border-b-2 border-border-dark justify-end">
            <div className="flex items-center gap-2 mr-2">
              <Button
                variant="outline"
                size="sm"
                className="flex gap-2 items-center cursor-pointer rounded-lg h-7"
              >
                <Link
                  target="_blank"
                  href={selectedArticle?.url ?? ""}
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
          </div>
          {selectedArticle && selectedArticle.id ? (
            <section
              ref={scrollContainerRef}
              className="flex-1 bg-bg-main overflow-y-auto relative flex justify-center scroll-smooth scrollbar-custom"
            >
              <div className={`my-6 rounded-3xl border h-fit w-[93%]`}>
                <div
                  className={`bg-white min-h-full p-12 relative border-x rounded-[20px] border`}
                >
                  <div className="text-title-red font-bold text-sm tracking-wider uppercase px-2 py-1 mb-2 rounded w-fit ml-auto">
                    {selectedArticle?.company_news?.[0]?.company?.name || "-"}
                  </div>

                  <div className="mb-6 mt-2">
                    <h1 className="text-xl font-bold text-title-dark mb-4 leading-tight">
                      {selectedArticle.header}
                    </h1>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-2 text-sm text-neutral-500">
                      <span className="font-bold text-subtitle-dark text-sm">
                        {selectedArticle?.news_source?.name ?? "Unknown Source"}
                      </span>
                      {/* <span className="w-1.5 h-1.5 rounded-full bg-neutral-300"></span>
                    <span className="text-subtitle-dark font-medium text-sm">
                      {selectedArticle.author || "Unknown author"}
                    </span> */}
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 "></span>
                      <span className="text-subtitle-dark font-medium text-sm">
                        {formatDate(selectedArticle.published_date)}
                      </span>
                    </div>
                  </div>

                  <div ref={contentRef}>
                    {/* floating categories box */}
                    <div className="-mt-10 float-right min-w-[186px] ml-6 mb-4 border border-neutral-200 rounded-md bg-white p-4 text-subtitle-dark not-prose">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-[13px] text-title-dark tracking-wider">
                            Category
                          </div>
                          <CircleQuestionMark className="size-4 h-fit text-subtitle-dark/80" />
                        </div>
                        <ul className="space-y-1 text-[13px] font-medium">
                          <li>Category 1</li>
                          <li>Category 2</li>
                        </ul>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-[13px] text-title-dark tracking-wider">
                            Industry
                          </div>
                          <CircleQuestionMark className="size-4 h-fit text-subtitle-dark/80" />
                        </div>
                        <ul className="space-y-1 text-[13px] font-medium">
                          <li>Industry 1</li>
                          <li>Industry 2</li>
                        </ul>
                      </div>
                    </div>

                    <div className="prose prose-sm max-w-none text-title-dark/90 text-sm leading-8 selection:bg-blue-100 selection:text-blue-900 whitespace-pre-wrap">
                      {formattedActiveArticleContent ?? ""}
                    </div>
                    <div className="text-subtitle-dark/80 text-sm text-end mt-4 font-semibold">
                      {selectedArticle.id}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : loadingNextCenterNews ? (
            <div className="flex-1 bg-bg-main overflow-y-auto relative flex justify-center scroll-smooth scrollbar-custom items-center text-subtitle-dark">
              <Loader2 className="animate-spin size-5" />
            </div>
          ) : (
            <div className="flex-1 bg-bg-main overflow-y-auto relative flex justify-center scroll-smooth scrollbar-custom items-center text-subtitle-dark">
              <span>No news selected</span>
            </div>
          )}
        </div>

        {/* {showFeedbackModal && (
          <FeedBackModal
            closeModal={() => setShowFeedbackModal(false)}
            pageType={trainingPageType}
            newsId={centerArticle?.id as number}
            onAddFeedback={(content) => {
              setNotes((prev) => [...prev, content]);
            }}
          />
        )} */}

        {/* Add company dialog */}
        <AddCompanyModal
          open={addCompanyModalOpened}
          onClose={() => setAddCompanyModalOpened(false)}
          onDelete={() => {}}
          statuses={statuses}
          origins={origins}
          tags={tags}
          activeNewsUrl={selectedArticle?.url ?? ""}
        />
      </div>
    </div>
  );
}
