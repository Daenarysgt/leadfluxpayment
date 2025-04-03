
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

const CaptureRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;
  
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  // Get capture settings or use defaults
  const title = content?.title || "Join our newsletter";
  const description = content?.description || "Get the latest updates directly to your inbox.";
  const placeholder = content?.placeholder || "Your email address";
  const buttonText = content?.buttonText || "Subscribe";
  const successMessage = content?.successMessage || "Thank you for subscribing!";
  
  // Get style settings or use defaults
  const titleAlignment = content?.style?.titleAlignment || "center";
  const primaryColor = content?.style?.primaryColor || "#8B5CF6";
  const captureType = content?.captureType || "email";
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      setSubmitted(true);
      setValue("");
      
      // If using preview mode, reset after 3 seconds for demo purposes
      if (element.previewMode) {
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      }
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
            <Input
              type={captureType === "email" ? "email" : "text"}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full"
              required
            />
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
