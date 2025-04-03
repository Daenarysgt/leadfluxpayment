
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BuilderEmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-[400px] p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Nenhum funil selecionado</h2>
        <p className="text-muted-foreground mb-4">
          Volte para a página inicial e selecione ou crie um funil para começar.
        </p>
        <Button className="w-full" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o início
        </Button>
      </div>
    </div>
  );
};

export default BuilderEmptyState;
