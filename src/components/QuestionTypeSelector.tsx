
import { QuestionType } from "@/utils/types";
import { Card } from "@/components/ui/card";
import { 
  AlignLeft, CheckSquare, CircleUserRound, Calendar, FileText, 
  Globe, Hash, Heart, ImageIcon, Layers, Mail, Phone, Star, Type,
  Images, Ruler, Weight, SlidersHorizontal, ImagePlus
} from "lucide-react";

interface QuestionTypeSelectorProps {
  onSelectType: (type: QuestionType) => void;
}

const QuestionTypeSelector = ({ onSelectType }: QuestionTypeSelectorProps) => {
  const questionTypes = [
    { type: QuestionType.ShortText, icon: Type, label: "Texto Curto" },
    { type: QuestionType.LongText, icon: AlignLeft, label: "Texto Longo" },
    { type: QuestionType.SingleChoice, icon: CheckSquare, label: "Escolha Única" },
    { type: QuestionType.MultipleChoice, icon: Layers, label: "Múltipla Escolha" },
    { type: QuestionType.ImageChoice, icon: ImagePlus, label: "Escolha com Imagem" },
    { type: QuestionType.Email, icon: Mail, label: "Email" },
    { type: QuestionType.Phone, icon: Phone, label: "Telefone" },
    { type: QuestionType.Name, icon: CircleUserRound, label: "Nome" },
    { type: QuestionType.Gender, icon: CircleUserRound, label: "Gênero" },
    { type: QuestionType.Rating, icon: Star, label: "Avaliação" },
    { type: QuestionType.Date, icon: Calendar, label: "Data" },
    { type: QuestionType.File, icon: FileText, label: "Upload de Arquivo" },
    { type: QuestionType.Website, icon: Globe, label: "Website" },
    { type: QuestionType.Number, icon: Hash, label: "Número" },
    { type: QuestionType.Carousel, icon: Images, label: "Carrossel" },
    { type: QuestionType.Height, icon: Ruler, label: "Altura" },
    { type: QuestionType.Weight, icon: Weight, label: "Peso" },
    { type: QuestionType.Comparison, icon: SlidersHorizontal, label: "Comparação" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {questionTypes.map((item) => {
        const Icon = item.icon;
        
        return (
          <Card 
            key={item.type}
            className="p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSelectType(item.type)}
          >
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-sm">{item.label}</span>
          </Card>
        );
      })}
    </div>
  );
};

export default QuestionTypeSelector;
