import { FileIcon, Download, Trash2 } from "lucide-react";
import { ExistingDocument } from "./company/AddCompanyModal";


interface Props {
  files: ExistingDocument[];
  onDelete?: (id: number) => void;
}

export function ExistingFilesList({ files, onDelete }: Props) {
  if (files.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No previous files, upload new files.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between bg-white border rounded-lg px-3 py-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon className="w-4 h-4 text-slate-400" />
            <a
              href={file.url}
              target="_blank"
              className="text-sm text-slate-700 truncate hover:underline"
            >
              {file.name}
            </a>
          </div>

          {onDelete && (
            <button
              onClick={() => onDelete(file.id)}
              className="text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
