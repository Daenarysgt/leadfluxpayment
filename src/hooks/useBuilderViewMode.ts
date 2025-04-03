
import { useState, useCallback } from "react";
import { useStore } from "@/utils/store";

export const useBuilderViewMode = () => {
  const { currentFunnel } = useStore();
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewActive, setPreviewActive] = useState(false);
  
  const togglePreview = useCallback(() => {
    setPreviewActive(prev => !prev);
  }, []);
  
  const openFullPreview = useCallback((saveFunction: () => void) => {
    if (currentFunnel) {
      saveFunction();
      window.open(`/preview/${currentFunnel.id}`, '_blank');
    }
  }, [currentFunnel]);
  
  return {
    viewMode,
    setViewMode,
    previewActive,
    setPreviewActive,
    togglePreview,
    openFullPreview
  };
};
