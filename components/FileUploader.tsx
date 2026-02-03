import React, { useState, useRef, useCallback } from "react";
import {
  FileRecord,
  FileUploaderProps,
  UploadStatus,
} from "@/lib/types/file-upload";
import { FileListItem } from "./FileListItem";
import { UploadIcon } from "lucide-react";
import { simulateFileUpload } from "@/lib/fileUploadProgress";
import { ExistingFilesList } from "./ExistingFilesList";

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  onDelete,
  // maxFiles = 5,
  // maxSizeMB = 10,
  acceptedTypes = ["image/*", "application/pdf"],
  className = "",
  existingFiles,
  isEditMode,
}) => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const filesArray = Array.from(selectedFiles);
      // const availableSlots = maxFiles - files.length;
      // const filesToProcess = filesArray.slice(0, availableSlots);
      const filesToProcess = filesArray;

      const newRecords: FileRecord[] = filesToProcess
        .filter((file) => {
          // if (file.size > maxSizeMB * 1024 * 1024) {
          //   alert(`File ${file.name} exceeds ${maxSizeMB}MB.`);
          //   return false;
          // }
          return true;
        })
        .map((file) => ({
          id: Math.random().toString(36).substring(7),
          file,
          progress: 0,
          status: "uploading" as UploadStatus,
        }));

      if (newRecords.length === 0) return;

      setFiles((prev) => [...prev, ...newRecords]);

      newRecords.forEach(async (record) => {
        try {
          await simulateFileUpload(record.file, (progress) => {
            setFiles((current) =>
              current.map((f) => (f.id === record.id ? { ...f, progress } : f)),
            );
          });

          setFiles((current) => {
            // Fix: Explicitly cast 'success' as UploadStatus to prevent type widening to string
            const updated = current.map((f) =>
              f.id === record.id
                ? { ...f, status: "success" as UploadStatus, progress: 100 }
                : f,
            );
            if (onUploadComplete) {
              onUploadComplete(
                updated
                  .filter((u) => u.status === "success")
                  .map((u) => u.file),
              );
            }
            return updated;
          });
        } catch (error) {
          setFiles((current) =>
            current.map((f) =>
              f.id === record.id
                ? {
                    ...f,
                    status: "error" as UploadStatus,
                    errorMessage:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : f,
            ),
          );
        }
      });
    },
    [
      files,
      //  maxFiles, maxSizeMB,
      onUploadComplete,
    ],
  );

  const removeFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    if (onUploadComplete) {
      onUploadComplete(
        updated.filter((u) => u.status === "success").map((u) => u.file),
      );
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Existing files */}
      {(isEditMode && existingFiles.length > 0) &&  (
        <div className="mb-4 mt-2">
          <h3 className="text-sm font-medium text-subtitle-dark mb-2">
            Previous files
          </h3>

          <ExistingFilesList onDelete={onDelete} files={existingFiles} />
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          processFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
          flex flex-col items-center justify-center py-8 px-4 text-center
          ${
            isDragging
              ? "border-blue-500 bg-blue-50/50 scale-[0.98]"
              : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
          }
        `}
      >
        <input
          type="file"
          multiple
          hidden
          ref={fileInputRef}
          onChange={(e) => processFiles(e.target.files)}
          accept={acceptedTypes.join(",")}
        />

        <div
          className={`mb-2 transition-colors ${isDragging ? "text-blue-500" : "text-slate-400"}`}
        >
          <UploadIcon className="w-8 h-8 mx-auto" />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700">
            Click to upload or drag and drop
          </p>
          {/*
          <p className="text-xs text-slate-400 mt-1">
            Max {maxFiles} files, {maxSizeMB}MB each
          </p>
          */}
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((record) => (
            <FileListItem
              key={record.id}
              record={record}
              onRemove={removeFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};
