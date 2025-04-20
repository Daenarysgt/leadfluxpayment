import { ComponentType } from "@/utils/types";

export function getElementTitle(type: string): string {
  switch (type) {
    case ComponentType.Text:
      return "Texto";
    case ComponentType.MultipleChoice:
      return "Múltipla Escolha";
    case ComponentType.MultipleChoiceImage:
      return "Múltipla Escolha com Imagem";
    case ComponentType.Button:
      return "Botão";
    case ComponentType.Image:
      return "Imagem";
    case ComponentType.Carousel:
      return "Carrossel";
    case ComponentType.Height:
      return "Altura";
    case ComponentType.Weight:
      return "Peso";
    case ComponentType.Comparison:
      return "Comparação";
    case ComponentType.Arguments:
      return "Argumentos";
    case ComponentType.Testimonials:
      return "Depoimentos";
    case ComponentType.Rating:
      return "Avaliação";
    case ComponentType.Spacer:
      return "Espaçador";
    case ComponentType.Graphics:
      return "Gráficos";
    case ComponentType.Level:
      return "Nível";
    case ComponentType.Capture:
      return "Captura";
    case ComponentType.Loading:
      return "Carregamento";
    case ComponentType.Cartesian:
      return "Cartesiano";
    case ComponentType.Video:
      return "Vídeo";
    case ComponentType.Price:
      return "Preço";
    case ComponentType.Notes:
      return "Notas";
    case ComponentType.Timer:
      return "Temporizador";
    default:
      return type;
  }
}
