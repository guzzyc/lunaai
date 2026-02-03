import { ExistingDocument } from "@/components/company/AddCompanyModal";

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface FileRecord {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  errorMessage?: string;
}

export interface FileUploaderProps {
  onUploadComplete?: (files: File[]) => void;
  onDelete?: (id: number) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
  existingFiles:ExistingDocument[];
  isEditMode:boolean;
}
