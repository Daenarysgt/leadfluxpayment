
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepSettingsProps {
  title: string;
  buttonText: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onButtonTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StepSettings = ({
  title,
  buttonText,
  onTitleChange,
  onButtonTextChange
}: StepSettingsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 border-b">
      <div>
        <Label htmlFor="step-title">Step Title</Label>
        <Input 
          id="step-title" 
          value={title} 
          onChange={onTitleChange}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="button-text">Button Text</Label>
        <Input 
          id="button-text" 
          value={buttonText} 
          onChange={onButtonTextChange}
          className="mt-1"
        />
      </div>
    </div>
  );
};

export default StepSettings;
