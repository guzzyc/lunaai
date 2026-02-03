import {
  DefinitionItem,
  TabType,
  TargetItem,
  User,
} from "@/lib/types/user-types";
import { Loader2, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "../DeleteConfirmation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  addNewDefinition,
  addNewTarget,
  deleteDefinition,
  editDefinition,
  editTarget,
} from "@/lib/actions/definition";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewsSourceType } from "@/lib/types/news-types";

interface TargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (targetData: TargetItem) => void;
  onEditSubmit: (targetData: TargetItem) => void;
  onDelete: (id: number) => void;
  editingTarget: TargetItem | null;
  activeTab?: TabType;
  users: User[];
  newsSourcesOptions:NewsSourceType[]
}

const trainingTypeOptions = [
  { name: "Cleaning", value: "cleaning" },
  { name: "Classifying", value: "classifying" },
];

const TargetModal: React.FC<TargetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onEditSubmit,
  editingTarget,
  onDelete,
  activeTab,
  users,
  newsSourcesOptions
}) => {
  const [selectedUserId, setSelectedUserId] = useState<number>();
  const [isUserSelectorOpen, setUserSelectorOpen] = useState(false);
  const [isSubmitting, setisSubmitting] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<TargetItem>({
    trainingType: "",
    value: "",
    sourceId:"",
    sourceName:""
  });
  const [errors, setErrors] = useState<{
    trainingType?: string;
    source?: string;
    value?: string;
  }>({});

  useEffect(() => {
    if (editingTarget) {
      setFormData({
        trainingType: editingTarget.trainingType,
        value: editingTarget.value,
        id: editingTarget.id,
        user: editingTarget.user,
        userId: editingTarget.userId,
        sourceId:editingTarget.sourceId,
        sourceName:editingTarget.sourceName
      });
      setSelectedUserId(editingTarget.userId);
      console.log("editing target detected", editingTarget);
    } else {
      setFormData({
        trainingType: "",
        value: "",
        id: undefined,
        user: "",
        sourceId:"",
        sourceName:""
      });
    }
    setErrors({});
  }, [editingTarget, isOpen]);
  if (!isOpen) return null;

  const validate = () => {
    const newErrors: {
      trainingType?: string;
      value?: string;
    } = {};

    if (!formData.trainingType.trim())
      newErrors.trainingType = "Training type is required";
    if (!formData.value.trim()) newErrors.value = "Value is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setisSubmitting(true);
      try {
        let result: TargetItem;

        if (editingTarget) {
          result = await editTarget({
            id: editingTarget.id as number,
            value: formData.value,
            trainingType: formData.trainingType,
            userId: selectedUserId as number,
            sourceId:formData.sourceId
          });
          toast.success("Target updated successfully", {
            richColors: true,
          });
          onEditSubmit(result);
        } else {
          result = await addNewTarget({
            trainingType: formData.trainingType,
            value: formData.value,
            userId: selectedUserId as number,
            sourceId:formData.sourceId
          });
          toast.success("Target added successfully", { richColors: true });
          onSubmit(result);
        }

        onClose();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(
            `Failed to ${editingTarget ? "update" : "add"} target: ${
              error.message
            }`,
            { richColors: true }
          );
        }
      } finally {
        setisSubmitting(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!editingTarget) return;
    setIsDeleting(true);
    try {
      await deleteDefinition({ id: editingTarget.id as number });
      toast.success("Target deleted successfully", { richColors: true });
      onClose();
      onDelete(editingTarget?.id as number);
      setIsDeleteConfirmModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete target", { richColors: true });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b-[1.5px] border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingTarget ? `Edit Target` : `Add New Target`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="cursor-pointer size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>

            <Popover
              open={isUserSelectorOpen}
              onOpenChange={setUserSelectorOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="md"
                  role="combobox"
                  className="w-full justify-between text-sm font-normal"
                >
                  {formData.user ? (
                    <span>
                      {users.find((u) => u.name === formData.user)?.name}
                    </span>
                  ) : (
                    <span className="text-subtitle-dark">Select user</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-sm" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0 z-[1000] min-w-[250px]">
                <Command>
                  <CommandInput placeholder="Search user..." />
                  <CommandEmpty>No user found.</CommandEmpty>

                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.name}
                        onSelect={() => {
                          setFormData({
                            ...formData,
                            user: user.name,
                          });
                          setUserSelectorOpen(false);
                          setSelectedUserId(user.id);
                        }}
                        className="text-subtitle-dark font-medium"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.user === user.name
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {user.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Training type
            </label>
            <Select
              key={formData.trainingType || "empty"}
              onValueChange={(value) => {
                setFormData({ ...formData, trainingType: value });
                setErrors({ ...errors, trainingType: undefined });
              }}
              value={formData.trainingType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a training type" />
              </SelectTrigger>
              <SelectContent className="z-[999]">
                <SelectGroup>
                  <SelectLabel>Training types</SelectLabel>
                  {trainingTypeOptions?.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.trainingType && (
              <p className="mt-1 text-xs text-danger">{errors.trainingType}</p>
            )}
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <Select
              key={formData.sourceId || "empty"}
              onValueChange={(value) => {
                setFormData({ ...formData, sourceId: value });
                setErrors({ ...errors, source: undefined });
              }}
              value={formData.sourceId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a news source" />
              </SelectTrigger>
              <SelectContent className="z-[999]">
                <SelectGroup>
                  <SelectLabel>Source</SelectLabel>
                  {newsSourcesOptions?.map((source) => (
                    <SelectItem key={source.id} value={source.id.toString()}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.source && (
              <p className="mt-1 text-xs text-danger">{errors.source}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value
            </label>
            <Input
              type="number"
              value={formData.value}
              onChange={(e) => {
                setFormData({ ...formData, value: e.target.value });
                setErrors({ ...errors, value: undefined });
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.value ? "border-red-500" : "border-gray-200"
              }`}
              placeholder={`Enter ${activeTab} value`}
            />
            {errors.value && (
              <p className="mt-1 text-xs text-danger">{errors.value}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            {editingTarget && (
              <Button
                size="md"
                type="button"
                color="#CB0000"
                onClick={() => setIsDeleteConfirmModalOpen(true)}
                variant="outline"
                className="text-danger cursor-pointer flex items-center gap-2 flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors border-danger/30 hover:bg-danger/5"
              >
                <Trash2 className="size-4" />
                <span>Delete {activeTab}</span>
              </Button>
            )}
            <Button
              size="md"
              type="submit"
              className="flex gap-2 items-center cursor-pointer flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              <span>{editingTarget ? "Save Changes" : `Add ${activeTab}`}</span>
            </Button>
          </div>
        </form>
      </div>

      <DeleteConfirmationModal
        title="Delete target"
        description="Are you sure you want to delete this target?"
        isOpen={isDeleteConfirmModalOpen}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteConfirmModalOpen(false)}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TargetModal;
