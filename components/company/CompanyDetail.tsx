import { company as Company } from "@/app/generated/prisma/client";
import {
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CompanyNewsItem,
  CompanyType,
  SingleTaskType,
} from "@/lib/types/news-types";
import { formatDate } from "@/lib/utils";
import AddTaskModal from "./AddTaskModal";

const CompanyDetail = ({
  activeCompany,
  tasks: initialTasks,
  statusName,
  originName,
}: {
  activeCompany: CompanyType;
  tasks: SingleTaskType[];
  statusName?: string | null;
  originName?: string | null;
}) => {
  const [loadinNewses, setLoadinNewses] = useState(false);
  const [tasks, setTasks] = useState<SingleTaskType[]>(initialTasks);
  const [editingTask, setEditingTask] = useState<SingleTaskType | null>(null);
  const [isTaskCollapsed, setTaskCollapsed] = useState(false);
  const [isAddTaskOpened, setAddTaskOpened] = useState(false);
  const [isNewsCollapsed, setNewsCollapsed] = useState(false);
  const [isHistoryCollapsed, setHistoryCollapsed] = useState(false);
  const [isNoteCollapsed, setNoteCollapsed] = useState(false);
  const [newses, setNewses] = useState<CompanyNewsItem[]>([]);

  console.log("activeeeee", activeCompany);

  const loadNewses = async (companyId: number) => {
    setLoadinNewses(true);

    try {
      const response = await fetch(`/api/newses?companyId=${companyId}`);
      const data = await response.json();

      setNewses(data);
    } catch (error) {
      console.error("Failed to company newses:", error);
    } finally {
      setLoadinNewses(false);
    }
  };

  useEffect(() => {
    if (activeCompany?.id) {
      loadNewses(activeCompany.id);
    }
  }, [activeCompany]);

  useEffect(() => {
    console.log("newses data", newses);
  }, [newses]);

  const handleEditTaskClicked = (task: SingleTaskType) => {
    setEditingTask(task);
    setAddTaskOpened(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 scrollbar-custom bg-[#ECF1F6]">
      <div className="bg-white rounded-3xl border border-border-dark shadow-xs mb-6 space-y-2">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-subtitle-dark mb-1">
                {activeCompany.name}
              </h1>
              <div className="flex items-center gap-16">
                <div className="flex items-center gap-3 text-sm font-medium text-subtitle-dark">
                  <span>{formatDate(activeCompany.created_date)}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300"></span>
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/profile-image.png"
                      alt="Profile"
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                    <span>{activeCompany?.user?.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-subtitle-dark">
                  {statusName && (
                    <div>
                      Status:{" "}
                      <span className="font-semibold">{statusName}</span>
                    </div>
                  )}
                  {originName && (
                    <div>
                      Origin:{" "}
                      <span className="font-semibold">{originName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-bg-main rounded-lg border border-blue-50 h-11">
            <div className="w-fit flex items-center gap-3">
              <div className="flex items-center gap-3">
                {activeCompany?.website ? (
                  <>
                    <LinkIcon className="w-4 h-4 text-link" />
                    <Link
                      href={activeCompany?.website}
                      className="text-sm font-medium text-link hover:underline flex-1 truncate"
                    >
                      {activeCompany?.website}
                    </Link>
                  </>
                ) : (
                  <span className="text-sm text-subtitle-dark opacity-90">
                    Website not entered
                  </span>
                )}
              </div>
              {/* <Link
                href={activeCompany?.website || ""}
                className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-blue-100 cursor-pointer"
              >
                Go web
              </Link> */}
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 gap-4 bg-[#FAFAFA] rounded-b-3xl">
          {/* tasks section */}
          <div className="bg-white border border-border-dark drop-shadow-sm overflow-hidden rounded-xl">
            <div className="px-6 py-2 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  className="cursor-pointer"
                  onClick={() => setTaskCollapsed((prev) => !prev)}
                >
                  {isTaskCollapsed ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronUp size={16} />
                  )}
                </button>
                <h3 className="font-bold text-subtitle-dark">Tasks</h3>
              </div>
              <Button
                variant="ghost"
                className="text-blue-600 text-sm hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                size="sm"
                onClick={() => {
                  setAddTaskOpened(true);
                  setEditingTask(null);
                }}
              >
                <Plus size={14} />
                <span>Add</span>
              </Button>
            </div>
            <table
              className="w-full text-sm text-left table-fixed"
              style={{
                display: `${isTaskCollapsed ? "none" : "table"}`,
              }}
            >
              <thead className="bg-neutral-50 text-subtitle-dark/90 text-sm font-semibold border-b-[1.5px] border-border-dark">
                <tr>
                  <th className="px-6 py-3 w-48">Date</th>
                  <th className="px-6 py-3 w-48">Responsible</th>
                  <th className="px-6 py-3 w-full">Task detail</th>
                  <th className="px-6 py-3 w-32">Status</th>
                  <th className="px-6 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y-[1.5px] divide-border-dark text-sm text-title-dark font-medium">
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <tr key={index} className="hover:bg-neutral-50">
                      <td className="px-6 py-3">{formatDate(task.due_date)}</td>
                      <td className="px-6 py-3">Responsible</td>
                      <td className="px-6 py-3">Task detail</td>
                      <td className="px-6 py-3">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold border border-blue-200">
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 flex gap-2 justify-end">
                        <button
                          onClick={() => handleEditTaskClicked(task)}
                          className="text-subtitle-dark hover:text-blue-600 cursor-pointer"
                        >
                          <Pencil size={16} />
                        </button>
                        {/* <button className="text-subtitle-dark hover:text-red-600 cursor-pointer">
                        <Trash2 size={16} />
                      </button> */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-3 text-center text-neutral-400"
                    >
                      No tasks available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* news resource section */}
          <div className="bg-white border border-border-dark drop-shadow-sm overflow-hidden rounded-xl">
            <div className="px-6 py-3 border-b border-border-dark flex items-center gap-3">
              <button
                className="cursor-pointer"
                onClick={() => setNewsCollapsed((prev) => !prev)}
              >
                {isNewsCollapsed ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </button>
              <h3 className="font-bold text-subtitle-dark">News resource</h3>
            </div>
            <table
              style={{
                display: `${isNewsCollapsed ? "none" : "table"}`,
              }}
              className="w-full text-sm text-left table-fixed"
            >
              <thead className="bg-neutral-50 text-subtitle-dark/90 text-sm font-semibold border-b-[1.5px] border-border-dark">
                <tr>
                  <th className="px-6 py-3 w-48">Date</th>
                  <th className="px-6 py-3 w-full">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y-[1.5px] divide-border-dark text-sm text-title-dark font-medium">
                {loadinNewses ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-3 text-center text-neutral-400"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Loading news...</span>
                      </div>
                    </td>
                  </tr>
                ) : newses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-3 text-center text-neutral-400"
                    >
                      No news available
                    </td>
                  </tr>
                ) : (
                  newses.map((news, index) => (
                    <tr key={index} className="hover:bg-neutral-50">
                      <td className="px-6 py-3">
                        {news?.published_date ? (
                          formatDate(news?.published_date)
                        ) : (
                          <span className="text-neutral-400 textsm">
                            Not found
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          href={news?.url ?? ""}
                          className="text-blue-600 hover:underline truncate block w-96"
                        >
                          {news?.url ?? "No link available"}
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* history section */}
          <div className="bg-white border border-border-dark drop-shadow-sm overflow-hidden rounded-xl">
            <div className="px-6 py-3 border-b border-border-dark flex items-center gap-3">
              <button
                className="cursor-pointer"
                onClick={() => setHistoryCollapsed((prev) => !prev)}
              >
                {isHistoryCollapsed ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </button>
              <h3 className="font-bold text-subtitle-dark">History</h3>
            </div>
            <table
              style={{
                display: `${isHistoryCollapsed ? "none" : "table"}`,
              }}
              className="w-full text-sm text-left table-fixed"
            >
              <thead className="bg-neutral-50 text-subtitle-dark/90 text-sm font-semibold border-b-[1.5px] border-border-dark">
                <tr>
                  <th className="px-6 py-3 w-48">Date</th>
                  <th className="px-6 py-3 w-48">User</th>
                  <th className="px-6 py-3 w-full">History detail</th>
                </tr>
              </thead>
              <tbody className="divide-y-[1.5px] divide-border-dark text-sm text-title-dark font-medium">
                {Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="hover:bg-neutral-50">
                    <td className="px-6 py-3">17 October, 2025</td>
                    <td className="px-6 py-3 flex items-center gap-2">
                      <Image
                        src="/profile-image.png"
                        alt="Profile"
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                      <span>Cody Fischer</span>
                    </td>
                    <td className="px-6 py-3">History Detail</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* notes section */}
          <div className="bg-white border border-border-dark drop-shadow-sm overflow-hidden rounded-xl">
            <div className="px-6 py-3 border-b border-border-dark flex items-center gap-3">
              <button
                className="cursor-pointer"
                onClick={() => setNoteCollapsed((prev) => !prev)}
              >
                {isNoteCollapsed ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </button>
              <h3 className="font-bold text-subtitle-dark">Notes</h3>
            </div>
            <table
              style={{
                display: `${isNoteCollapsed ? "none" : "table"}`,
              }}
              className="w-full text-sm text-left table-fixed"
            >
              <thead className="bg-neutral-50 text-subtitle-dark/90 text-sm font-semibold border-b-[1.5px] border-border-dark">
                <tr>
                  <th className="px-6 py-3 w-48">Date</th>
                  <th className="px-6 py-3 w-48">User</th>
                  <th className="px-6 py-3 w-full">Note detail</th>
                </tr>
              </thead>
              <tbody className="divide-y-[1.5px] divide-border-dark text-sm text-title-dark font-medium">
                {activeCompany?.company_note?.length > 0 ? (
                  activeCompany?.company_note.map((note, index) => (
                    <tr key={index} className="hover:bg-neutral-50">
                      <td className="px-6 py-3">
                        {formatDate(note?.created_date) ?? "-"}
                      </td>
                      {note?.user?.name ? (
                        <td className="px-6 py-3 flex items-center gap-2">
                          <Image
                            src="/profile-image.png"
                            alt="Profile"
                            width={16}
                            height={16}
                            className="rounded-full"
                          />
                          <span>{note?.user?.name}</span>
                        </td>
                      ) : (
                        <td className="px-6 py-3 flex items-center gap-2">
                          {"-"}
                        </td>
                      )}
                      <td className="px-6 py-3">{note?.note ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-3 text-center text-neutral-400"
                    >
                      No notes available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddTaskModal
        open={isAddTaskOpened}
        onClose={() => setAddTaskOpened(false)}
        editingTask={editingTask}
        onAdd={(task) => setTasks((prev) => [...prev, task])}
        onEdit={(task) =>
          setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
        }
        compId={activeCompany?.id}
      />
    </div>
  );
};

export default CompanyDetail;
