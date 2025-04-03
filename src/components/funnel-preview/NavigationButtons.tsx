
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  buttonText: string;
  primaryColor: string;
  onStepChange: (newStep: number) => void;
}

const NavigationButtons = ({ 
  currentStep, 
  totalSteps, 
  buttonText, 
  primaryColor, 
  onStepChange 
}: NavigationButtonsProps) => {
  return (
    <div className="flex justify-between pt-4">
      {currentStep > 0 && (
        <Button 
          variant="outline"
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
        >
          Voltar
        </Button>
      )}
      <Button 
        className="ml-auto" 
        style={{ backgroundColor: primaryColor }}
        onClick={() => {
          if (currentStep < totalSteps - 1) {
            onStepChange(currentStep + 1);
          }
        }}
      >
        {buttonText || 'Continuar'} <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
