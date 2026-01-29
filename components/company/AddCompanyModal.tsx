import React, { useState, useEffect, useRef } from "react";
import { Plus, X, ChevronDown, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { definition as Definition } from "@/app/generated/prisma/client";
import {
  createCompany,
  deleteCompany,
  editCompany,
} from "@/lib/actions/createCompanyAction";
import { toast } from "sonner";
import { ArticlesArrayType, CompanyType } from "@/lib/types/news-types";
import { FileUploader } from "../FileUploader";
import {
  createDocumentPlaceholder,
  deleteDocument,
  deleteDocumentPlaceholder,
  getDocumentUploadUrl,
  linkDocumentToCompany,
} from "@/lib/actions/document";
import { getCompanyDocuments } from "@/lib/queries/document";

interface CompanyData {
  name: string;
  url: string;
  status: string;
  origin: string;
  notes: string[];
  resourceUrls: string[];
  tags: string[];
}

export type ExistingDocument = {
  id: number;
  name: string | null;
  url?: string;
};

interface CompanyModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  origins: Definition[];
  statuses: Definition[];
  tags: Definition[];
  activeNewsUrl: string;
  editingCompany?: CompanyType | null;
  onAdd?: (addedCompany: CompanyType) => void;
  onEdit?: (editedCompany: CompanyType) => void;
}

const AddCompanyModal: React.FC<CompanyModalProps> = ({
  open,
  onClose,
  origins,
  statuses,
  tags,
  activeNewsUrl,
  editingCompany,
  onAdd,
  onEdit,
}) => {
  const [formData, setFormData] = useState<CompanyData>({
    name: "",
    url: "",
    status: "",
    origin: "",
    notes: [""],
    resourceUrls: [activeNewsUrl],
    tags: [],
  });

  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const [isSavingCompany, setSavingCompany] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingDocuments, setExistingDocuments] = useState<
    ExistingDocument[]
  >([]);
  const [removedDocumentIds, setRemovedDocumentIds] = useState<number[]>([]);

  const tagMenuRef = useRef<HTMLDivElement>(null);

  const isEditMode = !!editingCompany;


  useEffect(() => {
    if (
      open &&
      activeNewsUrl &&
      (!formData.resourceUrls.length ||
        (formData.resourceUrls.length === 1 && formData.resourceUrls[0] === ""))
    ) {
      setFormData((prev) => ({
        ...prev,
        resourceUrls: [activeNewsUrl],
      }));
    }
  }, [activeNewsUrl, open]);

  useEffect(() => {
    if (open && editingCompany) {
      console.log("edddddddd", editingCompany);
      const validTagIds =
        typeof editingCompany.tags === "string"
          ? editingCompany.tags
              .split(",")
              .map((t) => t.trim())
              .filter((id) => tags.some((tag) => tag.id.toString() === id))
          : [];

      setFormData({
        name: editingCompany.name ?? "",
        url: editingCompany?.website ?? "",
        status: editingCompany.status_id?.toString() ?? "",
        origin: editingCompany.origin_id?.toString() ?? "",
        notes: editingCompany.company_note?.length
          ? (editingCompany.company_note.map((note) => note.note) as string[])
          : [""],
        resourceUrls: editingCompany.company_news?.length
          ? (editingCompany.company_news.map(
              (news) => news.news?.url,
            ) as string[])
          : [activeNewsUrl || ""],
        tags: validTagIds,
      });
      //setUploadedFiles()

      setErrors({});
    }
  }, [open, editingCompany]);

  useEffect(() => {
    if (open && editingCompany?.id) {
      (async () => {
        async function loadExistingFiles() {
          const res = await fetch(
            `/api/companies/${editingCompany?.id.toString()}/documents`,
          );
          const docs = await res.json();

          const existing: ExistingDocument[] = docs.map((d: any) => ({
            id: d.id.toString(),
            name: d.name,
            url: d.url,
          }));

          setExistingDocuments(existing);
          setRemovedDocumentIds([]);
          setUploadedFiles([]);
        }

        loadExistingFiles();
      })();
    }
  }, [open, editingCompany]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Company name is required.";
    // if (!formData.url.trim()) newErrors.url = "URL is required.";
    // else if (!/^https?:\/\/.+/.test(formData.url))
    //   newErrors.url = "Enter a valid URL (must start with http or https).";

    if (!formData.status) newErrors.status = "Select a status.";
    if (!formData.origin) newErrors.origin = "Select an origin.";
    // Notes
    // if (!formData.notes || formData.notes.length === 0)
    //   newErrors.notes = "At least one note is required.";
    // else if (formData.notes.some((n) => !n.trim()))
    //   newErrors.notes = "All notes must have text.";

    // Resource URLs
    // if (!formData.resourceUrls || formData.resourceUrls.length === 0)
    //   newErrors.resourceUrls = "At least one resource URL is required.";
    // else if (formData.resourceUrls.some((u) => !/^https?:\/\/.+/.test(u)))
    //   newErrors.resourceUrls = "All resource URLs must be valid.";

    // Tags
    // if (!formData.tags || formData.tags.length === 0)
    //   newErrors.tags = "Select at least one tag.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addTag = (tagId: string) => {
    setFormData((prev) => {
      const isSelected = prev.tags.includes(tagId);
      return {
        ...prev,
        tags: isSelected
          ? prev.tags.filter((id) => id !== tagId)
          : [...prev.tags, tagId],
      };
    });

    setErrors((prev) => ({ ...prev, tags: "" }));
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addNewNote = () => {
    setFormData((prev) => ({
      ...prev,
      notes: [...prev.notes, ""],
    }));
  };

  const updateNote = (index: number, value: string) => {
    setFormData((prev) => {
      const updatedNotes = [...prev.notes];
      updatedNotes[index] = value;
      return { ...prev, notes: updatedNotes };
    });
    setErrors((prev) => ({ ...prev, notes: "" }));
  };

  const removeNote = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index),
    }));
  };

  const addNewResourceUrl = () => {
    setFormData((prev) => ({
      ...prev,
      resourceUrls: [...prev.resourceUrls, ""],
    }));
  };

  const updateResourceUrl = (index: number, value: string) => {
    setFormData((prev) => {
      const updatedUrls = [...prev.resourceUrls];
      updatedUrls[index] = value;
      return { ...prev, resourceUrls: updatedUrls };
    });
    setErrors((prev) => ({ ...prev, resourceUrls: "" }));
  };

  const removeResourceUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      resourceUrls: prev.resourceUrls.filter((_, i) => i !== index),
    }));
  };

  const handleUploadToAzure = async (companyId:number) => {
    for (const file of uploadedFiles) {
      // create document row
      const documentId = await createDocumentPlaceholder(file.name);

      //get SAS URL
      const sasUrl = await getDocumentUploadUrl(documentId, file.type);

      try {
        //upload directly to Azure
        await fetch(sasUrl, {
          method: "PUT",
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": file.type,
          },
          body: file,
        });
        // link to company
        await linkDocumentToCompany(companyId, documentId);
      } catch (error) {
        await deleteDocumentPlaceholder(documentId);
        throw new Error("File upload failed");
      }
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.", { richColors: true });
      return;
    }

    setSavingCompany(true);

    try {
      if (isEditMode && editingCompany?.id) {
        const updatedCompany = await editCompany(formData, editingCompany.id);

        try {
          // delete removed docs
          for (const docId of removedDocumentIds) {
            await deleteDocument(docId);
          }

          await handleUploadToAzure(updatedCompany.id)

          toast.success("Company updated successfully", { richColors: true });
          onEdit?.(updatedCompany);
        } catch (error) {
          throw error
        }
      } else {
        const addedCompany = await createCompany(formData);

        try {
          await handleUploadToAzure(addedCompany.id)
          toast.success("Company created successfully", { richColors: true });
          onAdd && onAdd(addedCompany);
        } catch (error) {
          await deleteCompany(addedCompany.id);
          throw error;
        }
      }

      onClose();
    } catch (err: any) {
      toast.error(
        isEditMode
          ? `Failed to update company, please fix the errors before saving: ${err.message}`
          : `Failed to create company, please fix the errors before saving: ${err.message}`,
        { richColors: true },
      );
      console.log("company save error", err.message);
    } finally {
      setSavingCompany(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        url: "",
        status: "",
        origin: "",
        notes: [""],
        resourceUrls: [""],
        tags: [],
      });

      setErrors({});
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="min-w-[674px] max-h-[90vh] px-0 flex flex-col"
      >
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg px-5">
            {editingCompany ? "Edit Company" : "Add Company"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 mb-3 px-5 space-y-6 flex-1 overflow-y-auto scrollbar-custom">
          {/* Name & URL Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-subtitle-dark">
                Name
              </label>
              <Input
                type="text"
                name="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-xs text-danger">{errors.name}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-subtitle-dark">
                URL
              </label>
              <Input
                name="url"
                type="text"
                placeholder="Enter URL"
                value={formData.url}
                onChange={handleChange}
              />
              {errors.url && (
                <p className="text-xs text-danger">{errors.url}</p>
              )}
            </div>
          </div>

          {/* Status & Origin Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* status option */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-subtitle-dark">
                Status
              </label>
              <Select
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, status: value }));
                  setErrors((prev) => ({ ...prev, status: "" }));
                }}
                value={formData.status}
              >
                <SelectTrigger
                  className={`w-full ${errors.status ? "border-danger!" : ""}`}
                >
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Statuses</SelectLabel>
                    {statuses?.map((status: Definition) => (
                      <SelectItem
                        key={status.id}
                        value={status?.id.toLocaleString() ?? ""}
                      >
                        {status?.value ?? "No value"}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-danger">{errors.status}</p>
              )}
            </div>
            {/* origin option */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-subtitle-dark">
                Origin
              </label>
              <Select
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, origin: value }));
                  setErrors((prev) => ({ ...prev, origin: "" }));
                }}
                value={formData.origin}
              >
                <SelectTrigger
                  className={`w-full ${errors.origin ? "border-danger!" : ""}`}
                >
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Origins</SelectLabel>
                    {origins?.map((origin: Definition) => (
                      <SelectItem
                        key={origin.id}
                        value={origin?.id.toLocaleString() ?? ""}
                      >
                        {origin?.value ?? "No value"}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.origin && (
                <p className="text-xs text-danger">{errors.origin}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-subtitle-dark">
                Notes
              </label>
              <button
                type="button"
                onClick={addNewNote}
                className="cursor-pointer flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus size={14} strokeWidth={3} />
                Add note
              </button>
            </div>
            {formData.notes.map((note, index) => (
              <div key={index} className="relative space-y-2">
                <Textarea
                  placeholder={`Add a note...`}
                  value={note}
                  onChange={(e) => updateNote(index, e.target.value)}
                />
                {errors.notes && (
                  <p className="text-xs text-danger">{errors.notes}</p>
                )}

                {formData.notes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeNote(index)}
                    className="cursor-pointer absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Resource URL */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-subtitle-dark">
                Resource URL
              </label>
              <button
                type="button"
                onClick={addNewResourceUrl}
                className="cursor-pointer flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus size={14} strokeWidth={3} />
                Add URL
              </button>
            </div>
            {formData.resourceUrls.map((url, index) => (
              <div key={index} className="relative">
                <Input
                  type="url"
                  placeholder={`Enter url...`}
                  value={url}
                  onChange={(e) => updateResourceUrl(index, e.target.value)}
                />

                {errors.resourceUrls && (
                  <p className="text-xs text-danger mt-1">
                    {errors.resourceUrls}
                  </p>
                )}

                {formData.resourceUrls?.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeResourceUrl(index)}
                    className="cursor-pointer absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Tags Multiselect */}
          <div className="flex flex-col gap-1.5" ref={tagMenuRef}>
            <label className="text-sm font-medium text-subtitle-dark">
              Tags
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
                className="w-full min-h-[42px] px-3 py-1.5 border border-gray-200 rounded-lg flex flex-wrap gap-1.5 items-center bg-white hover:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-left"
              >
                {formData.tags.length === 0 ? (
                  <span className="text-gray-400 text-sm px-1">
                    Select tags...
                  </span>
                ) : (
                  formData.tags.map((tagId) => {
                    const tagDef = tags.find((t) => t.id.toString() === tagId);

                    return (
                      <div
                        key={tagId}
                        className="inline-flex items-center gap-1 border border-gray-200 rounded-sm px-2 py-1 text-xs font-medium text-subtitle-dark"
                      >
                        {tagDef?.value}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tagId);
                          }}
                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <X size={12} strokeWidth={2.5} />
                        </span>
                      </div>
                    );
                  })
                )}
                <div className="ml-auto flex items-center pl-2">
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isTagMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {isTagMenuOpen && (
                <div className="absolute z-100 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {tags.map((tag: Definition) => {
                    const isSelected = formData.tags.includes(
                      tag.id?.toLocaleString(),
                    );
                    return (
                      <div
                        key={tag.id}
                        onClick={() => addTag(tag?.id.toLocaleString())}
                        className="flex items-center justify-between px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <span
                          className={`font-medium ${
                            isSelected ? "text-blue-700" : "text-gray-700"
                          }`}
                        >
                          {tag?.value}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {errors.tags && (
              <p className="text-xs text-danger mt-1">{errors.tags}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-subtitle-dark">
              Files
            </label>

            <FileUploader
              maxFiles={3}
              maxSizeMB={5}
              onUploadComplete={(files) => {
                setTimeout(() => setUploadedFiles(files), 0);
              }}
              onDelete={(id)=>{
                setRemovedDocumentIds(prev=>[...prev,id]);
                setExistingDocuments(prev => prev.filter(doc => doc.id !== id));
              }}
              className="mt-1"
              existingFiles={existingDocuments}
              isEditMode={isEditMode}
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-start! px-5 w-full">
          <Button
            onClick={handleSave}
            className="text-sm font-medium cursor-pointer flex items-center gap-2"
          >
            {isSavingCompany && <Loader2 className="size-4 animate-spin" />}
            <span>{isSavingCompany ? "Saving" : "Save"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCompanyModal;
