
import { cn } from "@/lib/utils";
import { LabelHTMLAttributes } from "react";

interface ConfigLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const ConfigLabel = ({ className, ...props }: ConfigLabelProps) => {
  return (
    <label
      className={cn("text-sm font-medium leading-none text-foreground", className)}
      {...props}
    />
  );
};
