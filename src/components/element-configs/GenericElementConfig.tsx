import { ElementConfigProps } from "@/types/canvasTypes";

const GenericElementConfig = ({ element }: ElementConfigProps) => {
  return (
    <div className="p-4">
      <p className="text-sm text-muted-foreground">
        Configuração não disponível para este tipo de elemento.
      </p>
    </div>
  );
};

export default GenericElementConfig; 