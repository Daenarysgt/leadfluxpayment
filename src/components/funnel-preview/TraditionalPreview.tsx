import React, { useState, useEffect } from 'react';
import { Step } from "@/utils/types";
import QuestionRenderer from './QuestionRenderer';
import NavigationButtons from './NavigationButtons';
import { accessService } from '@/services/accessService';

interface TraditionalPreviewProps {
  stepData: Step;
  primaryColor: string;
  activeStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  funnel: any;
}

const TraditionalPreview = ({ 
  stepData, 
  primaryColor, 
  activeStep, 
  totalSteps,
  onStepChange,
  funnel
}: TraditionalPreviewProps) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  useEffect(() => {
    const initSession = async () => {
      if (funnel) {
        const newSessionId = await accessService.logAccess(funnel.id);
        setSessionId(newSessionId);
      }
    };
    
    initSession();
  }, [funnel]);
  
  const handleStepChange = async (index: number) => {
    if (!funnel) return;
    
    // Registrar interação do usuário com o funil
    await accessService.updateProgress(funnel.id, index + 1, sessionId);
    
    // Se chegou na última etapa, registrar como conversão
    if (index === totalSteps - 1) {
      await accessService.updateProgress(funnel.id, index + 1, sessionId, true);
    }
    
    onStepChange(index);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">{stepData.title}</h2>
      
      {stepData.questions.map((question: any) => (
        <QuestionRenderer 
          key={question.id} 
          question={question} 
          primaryColor={primaryColor}
          activeStep={activeStep}
          onStepChange={handleStepChange}
          funnel={funnel}
        />
      ))}
      
      <NavigationButtons 
        currentStep={activeStep}
        totalSteps={totalSteps}
        buttonText={stepData.buttonText}
        primaryColor={primaryColor}
        onStepChange={handleStepChange}
      />
    </div>
  );
};

export default TraditionalPreview;
