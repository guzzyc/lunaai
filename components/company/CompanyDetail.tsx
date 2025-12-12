import { company as Company } from "@/app/generated/prisma/client";
import {
  Link as LinkIcon,
  Pencil,
  Plus,
  Trash2,
  X
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const CompanyDetail = ({ activeCompany }: { activeCompany: Company }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 scrollbar-custom bg-bg-main">
      <div className="bg-white rounded-3xl border border-border-dark shadow-xs mb-6 space-y-2">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-subtitle-dark mb-1">
                {activeCompany.name}
              </h1>
              <div className="flex items-center gap-3 text-sm font-medium text-subtitle-dark">
                <span>October 17, 2025</span>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300"></span>
                <div className="flex items-center gap-1.5">
                  <img
                    src="/profile-image.png"
                    className="w-4 h-4 rounded-full"
                  />
                  <span>Leslie Alexander</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1 items-center text-subtitle-dark">
              <button className="p-1 hover:bg-neutral-50 rounded-lg cursor-pointer">
                <Pencil className="w-4 h-4" />
              </button>
              <button className="p-1  hover:bg-neutral-50 rounded-lg cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-neutral-300" />
              <button className="p-1 hover:bg-neutral-50 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-bg-main rounded-lg border border-blue-50 h-11">
            <div className="w-fit flex items-center gap-3">
              <div className="flex items-center gap-3">
                <LinkIcon className="w-4 h-4 text-link" />
                <Link
                  href={activeCompany?.website || ""}
                  className="text-sm font-medium text-link hover:underline flex-1 truncate"
                >
                  {activeCompany?.website || "https://www.bloombergfinance.com"}
                </Link>
              </div>
              <Link
                href={activeCompany?.website || ""}
                className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-blue-100 cursor-pointer"
              >
                Go web
              </Link>
            </div>
          </div>
        </div>

        {/* tasks section */}
        <div className="bg-white border-y border-border-dark shadow-xs overflow-hidden">
          <div className="px-6 py-2 flex justify-between items-center">
            <h3 className="font-bold text-subtitle-dark">Tasks</h3>
            <Button
              variant="ghost"
              className="text-blue-600 text-sm hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
              size="sm"
            >
              <Plus size={14} />
              <span>Add task</span>
            </Button>
          </div>
          <table className="w-full text-sm text-left table-fixed">
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
              {Array.from({ length: 2 }).map((_, index) => (
                <tr key={index} className="hover:bg-neutral-50">
                  <td className="px-6 py-3">17 October, 2025</td>
                  <td className="px-6 py-3">Responsible</td>
                  <td className="px-6 py-3">Task detail</td>
                  <td className="px-6 py-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold border border-blue-200">
                      Status
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2 justify-end">
                    <button className="text-subtitle-dark hover:text-blue-600 cursor-pointer">
                      <Pencil size={16} />
                    </button>
                    <button className="text-subtitle-dark hover:text-red-600 cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* news resource section */}
        <div className="bg-white border-y border-border-dark shadow-xs overflow-hidden">
          <div className="px-6 py-3 border-b border-border-dark">
            <h3 className="font-bold text-subtitle-dark">News resource</h3>
          </div>
          <table className="w-full text-sm text-left table-fixed">
            <thead className="bg-neutral-50 text-subtitle-dark/90 text-sm font-semibold border-b-[1.5px] border-border-dark">
              <tr>
                <th className="px-6 py-3 w-48">Date</th>
                <th className="px-6 py-3 w-48">Portal name</th>
                <th className="px-6 py-3 w-full">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y-[1.5px] divide-border-dark text-sm text-title-dark font-medium">
              {Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="hover:bg-neutral-50">
                  <td className="px-6 py-3">17 October, 2025</td>
                  <td className="px-6 py-3">IronGate Partners</td>
                  <td className="px-6 py-3">
                    <Link
                      href="https://www.bloombergfinance.com"
                      className="text-blue-600 hover:underline truncate block w-96"
                    >
                      https://www.bloombergfinance.com
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* history section */}
        <div className="bg-white border-y border-border-dark shadow-xs overflow-hidden">
          <div className="px-6 py-3 border-b border-border-dark">
            <h3 className="font-bold text-subtitle-dark">History</h3>
          </div>
          <table className="w-full text-sm text-left table-fixed">
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
                    <img
                      src="/profile-image.png"
                      className="w-4 h-4 rounded-full"
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
        <div className="bg-white border-y border-border-dark shadow-xs overflow-hidden rounded-b-2xl">
          <div className="px-6 py-3 border-b border-border-dark">
            <h3 className="font-bold text-subtitle-dark">Notes</h3>
          </div>
          <table className="w-full text-sm text-left table-fixed">
            <thead className="bg-neutral-50 text-subtitle-dark/90 text-sm font-semibold border-b-[1.5px] border-border-dark">
              <tr>
                <th className="px-6 py-3 w-48">Date</th>
                <th className="px-6 py-3 w-48">User</th>
                <th className="px-6 py-3 w-full">Note detail</th>
              </tr>
            </thead>
            <tbody className="divide-y-[1.5px] divide-border-dark text-sm text-title-dark font-medium">
              {Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="hover:bg-neutral-50">
                  <td className="px-6 py-3">17 October, 2025</td>
                  <td className="px-6 py-3 flex items-center gap-2">
                    <img
                      src="/profile-image.png"
                      className="w-4 h-4 rounded-full"
                    />
                    <span>Leslie Alexander</span>
                  </td>
                  <td className="px-6 py-3">History Detail</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
