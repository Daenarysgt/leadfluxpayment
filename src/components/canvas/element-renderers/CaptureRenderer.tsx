import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface CaptureField {
  id: string;
  type: string;
  placeholder: string;
}

const CaptureRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;
  
  // Inicializa o estado para cada campo de captura
  const [formValues, setFormValues] = useState<{[fieldId: string]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  
  // Get capture settings or use defaults
  const title = content?.title || "Join our newsletter";
  const description = content?.description || "Get the latest updates directly to your inbox.";
  const buttonText = content?.buttonText || "Subscribe";
  const successMessage = content?.successMessage || "Thank you for subscribing!";
  
  // Detectar e migrar de versão antiga para nova
  let captureFields = content?.captureFields;
  
  if (!captureFields || !Array.isArray(captureFields) || captureFields.length === 0) {
    // Compatibilidade com versão anterior
    captureFields = [{
      id: uuidv4(),
      type: content?.captureType || 'email',
      placeholder: content?.placeholder || 'Your email address'
    }];
  }
  
  // Get style settings or use defaults
  const titleAlignment = content?.style?.titleAlignment || "center";
  const primaryColor = content?.style?.primaryColor || "#8B5CF6";
  
  const handleChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valida se todos os campos obrigatórios estão preenchidos
    const allFieldsFilled = captureFields.every(field => formValues[field.id]?.trim());
    
    if (allFieldsFilled) {
      setSubmitted(true);
      setFormValues({});
      
      // Se estiver no modo de preview, reseta após 3 segundos para demonstração
      if (element.previewMode) {
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      }
    }
  };

  const getInputType = (type: string) => {
    switch(type) {
      case 'email': return 'email';
      case 'phone': return 'tel';
      default: return 'text';
    }
  };

  return (
    <BaseElementRenderer {...props}>
      <div className="p-4 w-full">
        <div className={cn("mb-4", `text-${titleAlignment}`)}>
          <h3 className="text-lg font-medium">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            {captureFields.map((field) => (
              <Input
                key={field.id}
                type={getInputType(field.type)}
                placeholder={field.placeholder}
                value={formValues[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full"
                required
              />
            ))}
            <Button 
              type="submit" 
              className="w-full"
              style={{ 
                backgroundColor: primaryColor,
                borderColor: primaryColor,
              }}
            >
              {buttonText}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <CheckCircle className="text-green-500 h-12 w-12 mb-2" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default CaptureRenderer;
