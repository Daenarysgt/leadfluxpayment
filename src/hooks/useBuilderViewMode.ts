import { useState, useCallback } from "react";
import { useStore } from "@/utils/store";

export const useBuilderViewMode = () => {
  const { currentFunnel } = useStore();
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewActive, setPreviewActive] = useState(false);
  
  const togglePreview = useCallback(() => {
    if (!previewActive) {
      console.log("Builder - Sincronizando elementos antes de ativar preview");
      
      if (window.LEADFLUX_APP_HOOKS && window.LEADFLUX_APP_HOOKS.saveCurrentStepElements) {
        window.LEADFLUX_APP_HOOKS.saveCurrentStepElements();
      }
      
      setTimeout(() => setPreviewActive(true), 50);
    } else {
      setPreviewActive(false);
    }
  }, [previewActive]);
  
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
