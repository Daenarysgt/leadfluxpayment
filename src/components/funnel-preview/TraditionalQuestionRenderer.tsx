import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuestionType } from "@/utils/types";
import { ChevronRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface TraditionalQuestionRendererProps {
  stepData: any;
  activeStep: number;
  handleNextStep: (step: number) => void;
  isLastStep: boolean;
  primaryColor: string;
}

const TraditionalQuestionRenderer = ({ 
  stepData, 
  activeStep, 
  handleNextStep, 
  isLastStep, 
  primaryColor 
}: TraditionalQuestionRendererProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">{stepData.title}</h2>
      
      {stepData.questions.map((question: any) => (
        <div key={question.id} className="space-y-3">
          <h3 className="font-medium">{question.title}</h3>
          {question.description && (
            <p className="text-sm text-muted-foreground">{question.description}</p>
          )}
          
          {(question.type === QuestionType.ShortText || 
            question.type === QuestionType.Email ||
            question.type === QuestionType.Phone ||
            question.type === QuestionType.Name ||
            question.type === QuestionType.Website ||
            question.type === QuestionType.Number) && (
            <Input placeholder={`Enter your ${question.type}`} />
          )}
          
          {question.type === QuestionType.LongText && (
            <Textarea 
              placeholder="Type your answer here..."
              className="min-h-[100px]"
            />
          )}
          
          {(question.type === QuestionType.SingleChoice || 
            question.type === QuestionType.MultipleChoice) && 
            question.options && (
            <div className="space-y-2">
              {question.options.map((option: any) => (
                <div 
                  key={option.id} 
                  className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                >
                  <input 
                    type={question.type === QuestionType.SingleChoice ? "radio" : "checkbox"} 
                    id={option.id} 
                    name={question.id}
                    className="h-4 w-4"
                    style={{ accentColor: primaryColor }}
                  />
                  <Label htmlFor={option.id} className="cursor-pointer flex-1">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          )}
          
          {question.type === QuestionType.ImageChoice && question.options && (
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option: any) => (
                <div 
                  key={option.id} 
                  className="border rounded-md p-3 flex flex-col items-center hover:bg-muted/50 cursor-pointer"
                >
                  {option.emoji && (
                    <span className="text-2xl mb-2">{option.emoji}</span>
                  )}
                  {option.image && (
                    <img 
                      src={option.image} 
                      alt={option.text} 
                      className="w-full h-20 object-cover mb-2 rounded-md" 
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      id={option.id} 
                      name={question.id}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={option.id}>{option.text}</Label>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {question.type === QuestionType.Gender && (
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded-md p-3 flex flex-col items-center hover:bg-muted/50 cursor-pointer">
                <span className="text-2xl mb-2">👨</span>
                <Label>Masculino</Label>
              </div>
              <div className="border rounded-md p-3 flex flex-col items-center hover:bg-muted/50 cursor-pointer">
                <span className="text-2xl mb-2">👩</span>
                <Label>Feminino</Label>
              </div>
            </div>
          )}
          
          {question.type === QuestionType.Rating && (
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4, 5].map((rating) => (
                <div 
                  key={rating} 
                  className="w-10 h-10 flex items-center justify-center border rounded-full hover:bg-primary hover:text-primary-foreground cursor-pointer"
                >
                  {rating}
                </div>
              ))}
            </div>
          )}
          
          {question.type === QuestionType.Height && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Metros</Label>
                  <Input type="number" min="0" max="3" step="1" placeholder="1" />
                </div>
                <div>
                  <Label>Centímetros</Label>
                  <Input type="number" min="0" max="99" step="1" placeholder="75" />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="h-40 w-8 bg-gray-100 rounded-full relative flex items-center justify-center">
                  <div className="absolute text-xs">175 cm</div>
                </div>
              </div>
            </div>
          )}
          
          {question.type === QuestionType.Weight && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Peso (kg)</Label>
                  <Input type="number" min="1" step="1" placeholder="70" />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="h-8 w-40 bg-gray-100 rounded-full relative flex items-center justify-center">
                  <div className="absolute text-xs">70 kg</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      
      <div className="flex justify-between pt-4">
        {activeStep > 0 && (
          <Button 
            variant="outline"
            onClick={() => handleNextStep(Math.max(0, activeStep - 1))}
          >
            Voltar
          </Button>
        )}
        <Button 
          className="ml-auto" 
          style={{ backgroundColor: primaryColor }}
          onClick={() => {
            // Verificar se há mais etapas após esta
            handleNextStep(activeStep + 1);
          }}
        >
          {stepData.buttonText || 'Continuar'} <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TraditionalQuestionRenderer; 