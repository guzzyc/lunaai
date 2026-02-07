import React, { useMemo, useRef, useState } from "react";
import {
  DefinitionItem,
  TabType,
  TargetItem,
  User,
} from "@/lib/types/user-types";
import { cn, formatDate } from "@/lib/utils";
import {
  ArticleType,
  NewsesArrayType,
  NewsSearchItem,
  NewsSourceType,
} from "@/lib/types/news-types";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Image from "next/image";

interface NewsSearchTableProps {
  data: ArticleType[];
  onSelect?: (data: ArticleType) => void;
  selectedData?: ArticleType | null;
  loading?: boolean;
}

const NewsSearchTable: React.FC<NewsSearchTableProps> = ({
  data,
  onSelect,
  selectedData,
  loading = false,
}) => {
  type TargetSortKey = "title" | "source" | "date" | null;
  type SortDirection = "asc" | "desc";
  const [targetSortKey, setTargetSortKey] = useState<TargetSortKey>(null);
  const [targetSortDir, setTargetSortDir] = useState<SortDirection>("asc");

  const MIN_COL_WIDTH = 120;

  const [colWidths, setColWidths] = useState({
    source: 220,
    date: 180,
    title: 500,
  });

  const resizingCol = useRef<keyof typeof colWidths | null>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingCol.current) return;
    const dx = e.clientX - startX.current;
    const newWidth = Math.max(MIN_COL_WIDTH, startWidth.current + dx);

    setColWidths((prev) => ({
      ...prev,
      [resizingCol.current as string]: newWidth,
    }));
  };

  const handleMouseUp = () => {
    resizingCol.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const startResize = (e: React.MouseEvent, col: keyof typeof colWidths) => {
    e.preventDefault();
    e.stopPropagation(); // prevents sort click
    resizingCol.current = col;
    startX.current = e.clientX;
    startWidth.current = colWidths[col];

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const Resizer = ({ col }: { col: keyof typeof colWidths }) => (
    <div
      onMouseDown={(e) => startResize(e, col)}
      className="absolute -right-[7px] top-0 h-full w-4 flex items-center select-none justify-center cursor-grab group/handle"
    >
      <div className="relative h-full w-px bg-border-dark"></div>
      <div className="w-6 h-6 absolute top-1/2 -translate-y-1/2 bg-white border border-neutral-200 rounded-full shadow-sm flex items-center justify-center group-hover/handle:border-blue-400 group-hover/handle:ring-2 group-hover/handle:ring-blue-100 transition-all">
        <Image
          src="/icons/resizer.svg"
          alt="Luna logo"
          width={14}
          height={14}
          className="flex items-center p-0 m-0 pointer-events-none select-none"
          priority
        />
      </div>
    </div>
  );

  const handleTargetSort = (key: TargetSortKey) => {
    if (targetSortKey === key) {
      setTargetSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setTargetSortKey(key);
      setTargetSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    const targets = [...(data as ArticleType[])];

    //default order TARGET ID DESC
    if (!targetSortKey) {
      return targets.sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));
    }

    return targets.sort((a, b) => {
      let primaryCompare = 0;

      if (targetSortKey === "title") {
        primaryCompare = (a?.header ?? "").localeCompare(b?.header ?? "");
      }

      if (targetSortKey === "source") {
        primaryCompare = (a?.news_source?.name ?? "").localeCompare(
          b?.news_source?.name ?? "",
        );
      }

      if (targetSortKey === "date") {
        const aTime = a?.published_date
          ? new Date(a.published_date).getTime()
          : 0;
        const bTime = b?.published_date
          ? new Date(b.published_date).getTime()
          : 0;
        primaryCompare = aTime === bTime ? 0 : aTime < bTime ? -1 : 1;
      }

      if (targetSortDir === "desc") {
        primaryCompare *= -1;
      }

      // fallback to target id compare
      return primaryCompare !== 0
        ? primaryCompare
        : (b?.id ?? 0) - (a?.id ?? 0);
    });
  }, [data, targetSortKey, targetSortDir]);

  const SortIcon = ({
    active,
    dir,
  }: {
    active: boolean;
    dir: "asc" | "desc";
  }) => {
    if (!active) {
      return (
        <ArrowUpDown className="ml-2 h-4 w-4 text-gray-300 inline-block" />
      );
    }

    return dir === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4 inline-block" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 inline-block" />
    );
  };


  return (
  <div className="p-8 flex-1 flex flex-col min-h-0 w-full overflow-hidden">
    {/* Single scroll container for both horizontal and vertical scroll */}
    <div className="flex-1 overflow-auto border border-border-dark rounded-md scrollbar-custom">
      <table
        className="table-fixed text-left border-separate border-spacing-0"
        style={{ width: "max-content", minWidth: "100%" }}
      >
        <colgroup>
          <col style={{ width: colWidths.source }} />
          <col style={{ width: colWidths.date }} />
          <col style={{ width: colWidths.title }} />
        </colgroup>

        {/* THEAD is now inside the same table as TBODY */}
        <thead className="sticky top-0 z-20 bg-[#f8f8f8]">
          <tr className="border-b border-border-dark">
            <th
              className="relative px-6 py-4 text-sm font-semibold cursor-pointer select-none border-b border-border-dark"
              onClick={() => handleTargetSort("source")}
            >
              <span className="inline-flex items-center">
                Source
                <SortIcon active={targetSortKey === "source"} dir={targetSortDir} />
              </span>
              <Resizer col="source" />
            </th>
            <th
              className="relative px-6 py-4 text-sm font-semibold cursor-pointer select-none border-b border-border-dark"
              onClick={() => handleTargetSort("date")}
            >
              <span className="inline-flex items-center">
                Date
                <SortIcon active={targetSortKey === "date"} dir={targetSortDir} />
              </span>
              <Resizer col="date" />
            </th>
            <th
              className="relative px-6 py-4 text-sm font-semibold cursor-pointer select-none border-b border-border-dark"
              onClick={() => handleTargetSort("title")}
            >
              <span className="inline-flex items-center">
                Title
                <SortIcon active={targetSortKey === "title"} dir={targetSortDir} />
              </span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50 bg-white">
          {sortedData.length > 0 ? (
            sortedData.map((item) => (
              <tr
                onClick={onSelect && (() => onSelect(item))}
                key={item?.id}
                className={cn(
                  "group hover:bg-blue-50/50 transition-colors",
                  selectedData?.id === item?.id && "bg-blue-50"
                )}
              >
                <td className="px-6 py-4 text-sm text-subtitle-dark font-medium truncate">
                  {item?.news_source?.name ?? "-"}
                </td>
                <td className="px-6 py-4 text-sm text-subtitle-dark font-medium">
                  {formatDate(item?.published_date ?? "")}
                </td>
                <td className="px-6 py-4 text-sm text-subtitle-dark font-medium truncate">
                  {item?.header ?? "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                No items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
};

export default NewsSearchTable;
