import React, { useMemo, useState } from "react";
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

interface NewsSearchTableProps {
  data: ArticleType[];
  onSelect?: (data: ArticleType) => void;
  selectedData?: ArticleType | null;
}

const NewsSearchTable: React.FC<NewsSearchTableProps> = ({
  data,
  onSelect,
  selectedData,
}) => {
  type TargetSortKey = "title" | "source" | "date" | null;
  type SortDirection = "asc" | "desc";
  const [targetSortKey, setTargetSortKey] = useState<TargetSortKey>(null);
  const [targetSortDir, setTargetSortDir] = useState<SortDirection>("asc");

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
    <div className="p-8 rounded-md flex-1 flex flex-col overflow-hidden max-h-fit">
      <div className="border border-border-dark">
        <table className="w-full table-fixed text-left">
          <thead>
            <tr className="border-[1.5px] border-border-dark bg-[#f8f8f8]">
              <th
                className="px-6 py-4 text-sm font-semibold text-subtitle-dark cursor-pointer select-none"
                onClick={() => handleTargetSort("source")}
              >
                <span className="inline-flex items-center">
                  Source
                  <SortIcon
                    active={targetSortKey === "source"}
                    dir={targetSortDir}
                  />
                </span>
              </th>
              <th
                className="px-6 py-4 text-sm font-semibold text-subtitle-dark cursor-pointer select-none"
                onClick={() => handleTargetSort("date")}
              >
                <span className="inline-flex items-center">
                  Date
                  <SortIcon
                    active={targetSortKey === "date"}
                    dir={targetSortDir}
                  />
                </span>
              </th>
              <th
                className="px-6 py-4 text-sm font-semibold text-subtitle-dark cursor-pointer select-none"
                onClick={() => handleTargetSort("title")}
              >
                <span className="inline-flex items-center">
                  Title
                  <SortIcon
                    active={targetSortKey === "title"}
                    dir={targetSortDir}
                  />
                </span>
              </th>
            </tr>
          </thead>
        </table>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-custom border border-t-0 border-border-dark max-h-fit">
        <table className="w-full table-fixed text-left">
          <tbody className="divide-y divide-gray-50">
            {sortedData.length > 0 ? (
              sortedData.map((item) => (
                <tr
                  onClick={onSelect && (() => onSelect(item))}
                  key={item?.id}
                  className={cn(
                    "group hover:bg-blue-50/50 transition-colors border-y border-border",
                    selectedData?.id === item?.id && "bg-blue-50 border-l-2 border-l-link/80",
                  )}
                >
                  <td className="px-6 py-4 text-sm text-subtitle-dark font-medium truncate">
                    {item?.news_source?.name ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-subtitle-dark font-medium">
                    {formatDate(item?.published_date ?? "")}
                  </td>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <td className="px-6 py-4 text-sm text-subtitle-dark font-medium truncate select-none">
                        {item?.header ?? "-"}
                      </td>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-54">
                      <p>{item?.header ?? "-"}</p>
                    </TooltipContent>
                  </Tooltip>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-gray-500"
                >
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
