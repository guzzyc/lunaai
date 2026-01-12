import React from "react";
import {
  DefinitionItem,
  TabType,
  TargetItem,
  User,
} from "@/lib/types/user-types";
import { cn } from "@/lib/utils";
import { NewsSourceType } from "@/lib/types/news-types";

interface DataTableProps {
  data: (User | DefinitionItem | TargetItem)[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onSelect?: (data: User | DefinitionItem | TargetItem) => void;
  selectedData?: User | DefinitionItem | TargetItem | null;
  activeTab: TabType;
  newsSourcesOptions:NewsSourceType[]
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  onEdit,
  onDelete,
  onSelect,
  selectedData,
  activeTab,
  newsSourcesOptions
}) => {
  const isUserTab = activeTab === "Users";
  const isTargetTab = activeTab === "Target";

  console.log("DataTable rendered with data:", data, "Active Tab:", activeTab);

  return (
    <div className="max-h-144 overflow-y-auto overflow-x-auto scrollbar-custom">
      <table className="w-full text-left">
        <thead>
          <tr className="border-[1.5px] border-border-dark bg-[#f8f8f8]">
            <th className="px-6 py-4 text-sm font-semibold text-subtitle-dark w-20">
              ID
            </th>
            {!isTargetTab && (
              <th className="px-6 py-4 text-sm font-semibold text-subtitle-dark">
                Name
              </th>
            )}
            {isTargetTab && (
              <>
                <th className="px-6 py-4 text-sm font-semibold text-subtitle-dark">
                  User
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-subtitle-dark">
                  Source
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-subtitle-dark">
                  Training type
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-subtitle-dark">
                  Value
                </th>
              </>
            )}
            {isUserTab && (
              <>
                <th className="px-6 py-4 text-sm font-semibold text-subtitle-dark">
                  Email
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-subtitle-dark">
                  Role
                </th>
              </>
            )}
            {/* <th className="px-6 py-4 text-sm font-semibold text-subtitle-dark text-right">
              Actions
            </th> */}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.length > 0 ? (
            data.map((item) => (
              <tr
                onClick={onSelect && (() => onSelect(item as User))}
                key={item.id}
                className={cn(
                  "group hover:bg-blue-50/50 transition-colors border border-border",
                  selectedData?.id === item.id && "bg-blue-50"
                )}
              >
                <td className="px-6 py-4 text-sm text-subtitle-dark">
                  {item.id}
                </td>
                {!isTargetTab && (
                  <td className="px-6 py-4 text-sm text-subtitle-dark font-medium">
                    {(item as User | DefinitionItem).name}
                  </td>
                )}
                {isTargetTab && (
                  <>
                    <td className="px-6 py-4 text-sm text-subtitle-dark font-medium">
                      {(item as TargetItem).user}
                    </td>
                    <td className="px-6 py-4 text-sm text-subtitle-dark font-medium">
                      {(item as TargetItem).sourceName ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-subtitle-dark font-medium">
                      {(item as TargetItem).trainingType}
                    </td>
                    <td className="px-6 py-4 text-sm text-subtitle-dark font-medium">
                      {(item as TargetItem).value}
                    </td>
                  </>
                )}
                {isUserTab && (
                  <>
                    <td className="px-6 py-4 text-sm text-subtitle-dark font-medium">
                      {(item as User).email}
                    </td>
                    <td className="px-6 py-4 text-sm text-subtitle-dark capitalize font-medium">
                      {(item as User).role ?? "user"}
                    </td>
                  </>
                )}
                {/* <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(item as User)}
                      className="cursor-pointer p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit User"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td> */}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-12 text-center text-gray-500"
              >
                No items found in {activeTab}.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
