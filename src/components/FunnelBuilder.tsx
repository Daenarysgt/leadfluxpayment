
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StepNavigation from "./funnel-builder/StepNavigation";
import StepSettings from "./funnel-builder/StepSettings";
import QuestionsSection from "./funnel-builder/QuestionsSection";
import DesignTab from "./funnel-builder/DesignTab";
import SettingsTab from "./funnel-builder/SettingsTab";
import PreviewSection from "./funnel-builder/PreviewSection";
import { useFunnelStepManager } from "@/hooks/useFunnelStepManager";

const FunnelBuilder = () => {
  const [activeTab, setActiveTab] = useState("build");
  const { 
    currentFunnel, 
    currentStep,
    handleStepChange,
    handleAddStep,
    handleDeleteStep,
    handleUpdateStepTitle,
    handleUpdateButtonText,
    handleAddQuestion,
    handleDeleteQuestion,
    updateQuestion
  } = useFunnelStepManager();

  if (!currentFunnel) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-6">
        <h2 className="text-2xl font-semibold">No funnel selected</h2>
        <p className="text-muted-foreground">Please create or select a funnel to start building</p>
      </div>
    );
  }

  const currentStepData = currentFunnel.steps[currentStep];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)] mt-8">
      {/* Left side - Builder interface */}
      <div className="flex flex-col h-full overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b">
            <TabsList className="bg-transparent justify-start h-full p-0">
              <TabsTrigger 
                value="build" 
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                Build
              </TabsTrigger>
              <TabsTrigger 
                value="design" 
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                Design
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="build" className="flex-1 flex flex-col mt-0 overflow-hidden">
            <StepNavigation 
              currentStep={currentStep}
              totalSteps={currentFunnel.steps.length}
              onStepChange={handleStepChange}
              onAddStep={handleAddStep}
              onDeleteStep={handleDeleteStep}
            />
            
            <StepSettings 
              title={currentStepData.title}
              buttonText={currentStepData.buttonText}
              onTitleChange={handleUpdateStepTitle}
              onButtonTextChange={handleUpdateButtonText}
            />
            
            <QuestionsSection 
              questions={currentStepData.questions}
              onAddQuestion={handleAddQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onUpdateQuestion={updateQuestion}
              stepId={currentStepData.id}
            />
          </TabsContent>
          
          <TabsContent value="design" className="flex-1 overflow-y-auto mt-0">
            <DesignTab funnel={currentFunnel} />
          </TabsContent>
          
          <TabsContent value="settings" className="flex-1 overflow-y-auto mt-0">
            <SettingsTab funnel={currentFunnel} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Right side - Preview */}
      <PreviewSection />
    </div>
  );
};

export default FunnelBuilder;
