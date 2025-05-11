import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useValidatedNavigation } from "@/hooks/useValidatedNavigation";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  buttonText?: string;
  primaryColor?: string;
  onStepChange: (step: number) => void;
}

const NavigationButtons = ({ 
  currentStep, 
  totalSteps, 
  buttonText, 
  primaryColor, 
  onStepChange 
}: NavigationButtonsProps) => {
  // Usar o hook de navegação validada
  const handleStepChange = useValidatedNavigation(currentStep, onStepChange);
  
  return (
    <div className="flex justify-between pt-4">
      {currentStep > 0 && (
        <Button 
          variant="outline"
          onClick={() => handleStepChange(Math.max(0, currentStep - 1), { skipValidation: true })}
        >
          Voltar
        </Button>
      )}
      <Button 
        className={`ml-auto ${!primaryColor ? 'bg-primary text-primary-foreground' : ''}`}
        style={primaryColor ? { backgroundColor: primaryColor } : {}}
        onClick={() => {
          if (currentStep < totalSteps - 1) {
            // Ao avançar, validar os campos obrigatórios
            handleStepChange(currentStep + 1);
          }
        }}
      >
        {buttonText || 'Continuar'} <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
