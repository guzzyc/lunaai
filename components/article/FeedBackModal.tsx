"use client";

import { Loader2, ThumbsDown, X } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { useState } from "react";
import { saveFeedback } from "@/lib/actions/cleaningFeedbackAction";
import { toast } from "sonner";

const FeedBackModal = ({
  closeModal,
  onAddFeedback,
  pageType,
  newsId,
}: {
  closeModal: VoidFunction;
  onAddFeedback: (content:string)=>void;
  pageType: "cleaning" | "classifying";
  newsId: number;
}) => {
  const [isSaving, setSaving] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState("");

  const handleSaveFeedback = async () => {
    setSaving(true);
    try {
      await saveFeedback(activeFeedback, newsId);
      onAddFeedback(activeFeedback)
      closeModal()
    } catch (error) {
      toast.error("Failed to add feedback.");
    }
    finally{
      setSaving(false)
    }
  };
  return (
    <div className="absolute bottom-8 right-8 bg-white rounded-xl shadow-2xl border border-neutral-200 p-4 w-90 animate-in slide-in-from-bottom-4 z-30">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm text-title-dark">Add feedback</h4>
        <button
          onClick={closeModal}
          className="text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="relative max-h-12 mb-3 flex justify-between gap-4 items-center">
        <textarea
          placeholder="Notes..."
          className="w-full text-sm resize-none outline-none text-neutral-700 placeholder:text-neutral-400 bg-white px-2 py-1 rounded-lg border border-transparent focus:border-blue-100 focus:bg-blue-50/30 transition-all"
          rows={2}
          onChange={(e) => setActiveFeedback(e.target.value)}
        />
        <Button disabled={isSaving} size="sm" className="cursor-pointer flex items-center gap-2" onClick={handleSaveFeedback}>
          {isSaving && <Loader2 className="animate-spin size-4" />}
          <span>Save</span>
        </Button>
      </div>
      {pageType === "classifying" && (
        <div className="flex items-center gap-3">
          <button className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-danger/80 hover:text-red-600 hover:bg-red-50 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer">
            <Image
              src="/icons/dislike.svg"
              alt="Luna logo"
              width={16}
              height={16}
              className="flex items-center p-0 m-0 "
            />
            Dislike
          </button>
          <div className=" h-7 w-px bg-neutral-300"></div>
          <button className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 py-1.5 rounded-lg transition-colors border border-transparent hover:border-neutral-200 cursor-pointer">
            <ThumbsDown className="w-4 h-4 rotate-90" />
            Not sure
          </button>
          <div className=" h-7 w-px bg-neutral-300"></div>
          <button className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-success/80 hover:text-green-600 hover:bg-green-50 py-1.5 rounded-lg transition-colors border border-transparent hover:border-green-100 cursor-pointer">
            <Image
              src="/icons/like.svg"
              alt="Luna logo"
              width={16}
              height={16}
              className="flex items-center p-0 m-0 "
            />
            Like
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedBackModal;
