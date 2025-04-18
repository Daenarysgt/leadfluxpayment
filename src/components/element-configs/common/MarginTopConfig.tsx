import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MarginTopConfigProps {
  value: number | undefined;
  onChange: (value: number) => void;
  className?: string;
  label?: string;
  min?: number;
  max?: number;
}

const MarginTopConfig = ({
  value = 0,
  onChange,
  className,
  label = "Margem superior",
  min = -100,
  max = 100
}: MarginTopConfigProps) => {
  const [localValue, setLocalValue] = useState<number>(value || 0);

  useEffect(() => {
    setLocalValue(value || 0);
  }, [value]);

  const handleChange = (newValue: number[]) => {
    const value = newValue[0];
    setLocalValue(value);
    onChange(value);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-xs text-muted-foreground">{localValue}px</span>
      </div>
      <Slider
        defaultValue={[localValue]}
        value={[localValue]}
        min={min}
        max={max}
        step={1}
        onValueChange={handleChange}
        className="mt-2"
      />
    </div>
  );
};

export default MarginTopConfig; 