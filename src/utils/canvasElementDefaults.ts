import { CanvasElement } from "@/types/canvasTypes";
import { ComponentType } from "@/utils/types";

export const getDefaultContent = (componentType: string) => {
  console.log(`Getting default content for component type: ${componentType}`);
  switch(componentType) {
    case ComponentType.Text:
      return { 
        title: "Você distrai facilmente?", 
        description: "Este é um texto explicativo que descreve o propósito desta seção." 
      };
    case ComponentType.MultipleChoice:
      return { 
        title: "Você distrai facilmente?",
        options: [
          { 
            id: crypto.randomUUID(), 
            text: "Distrai-se facilmente", 
            emoji: "😵",
            style: {
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              textColor: "#000000",
              hoverTextColor: "#4B5563",
              selectedBackgroundColor: "#f5f3ff",
              selectedBorderColor: "#8b5cf6",
              selectedTextColor: "#4c1d95"
            },
            navigation: { type: "next" }
          },
          { 
            id: crypto.randomUUID(), 
            text: "Ocasionalmente, perde a concentração", 
            emoji: "😊",
            style: {
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              textColor: "#000000",
              hoverTextColor: "#4B5563",
              selectedBackgroundColor: "#f5f3ff",
              selectedBorderColor: "#8b5cf6",
              selectedTextColor: "#4c1d95"
            },
            navigation: { type: "next" }
          },
          { 
            id: crypto.randomUUID(), 
            text: "Raramente perde a concentração", 
            emoji: "🙂",
            style: {
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              textColor: "#000000",
              hoverTextColor: "#4B5563",
              selectedBackgroundColor: "#f5f3ff",
              selectedBorderColor: "#8b5cf6",
              selectedTextColor: "#4c1d95"
            },
            navigation: { type: "next" }
          },
          { 
            id: crypto.randomUUID(), 
            text: "Muito concentrado", 
            emoji: "🧐",
            style: {
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              textColor: "#000000",
              hoverTextColor: "#4B5563",
              selectedBackgroundColor: "#f5f3ff",
              selectedBorderColor: "#8b5cf6",
              selectedTextColor: "#4c1d95"
            },
            navigation: { type: "next" }
          },
        ],
        style: {
          borderRadius: 6,
          hoverColor: "#f3f4f6"
        },
        showEmojis: true,
        showImages: false,
        allowMultipleSelection: false,
        indicatorType: "circle",
        indicatorAlign: "left",
        continueButtonText: "Continuar"
      };
    case ComponentType.MultipleChoiceImage:
      return {
        title: "Escolha uma opção",
        options: [
          { 
            id: crypto.randomUUID(), 
            text: "Masculino", 
            image: "/placeholder.svg",
            style: { 
              backgroundColor: "#0F172A",
              aspectRatio: "1:1" as "1:1" | "16:9" | "9:16" | "4:3"
            },
            navigation: { type: "next" as "next" | "step" | "url" }
          },
          { 
            id: crypto.randomUUID(), 
            text: "Feminino", 
            image: "/placeholder.svg",
            style: { 
              backgroundColor: "#0F172A",
              aspectRatio: "1:1" as "1:1" | "16:9" | "9:16" | "4:3"
            },
            navigation: { type: "next" as "next" | "step" | "url" }
          }
        ]
      };
    case ComponentType.Button:
      return { buttonText: "Continuar" };
    case ComponentType.Image:
      return { imageUrl: "/placeholder.svg" };
    case ComponentType.Carousel:
      return { 
        options: [
          { id: crypto.randomUUID(), text: "Imagem 1", image: "/placeholder.svg" },
          { id: crypto.randomUUID(), text: "Imagem 2", image: "/placeholder.svg" },
          { id: crypto.randomUUID(), text: "Imagem 3", image: "/placeholder.svg" },
        ]
      };
    case ComponentType.Height:
      return { height: 170 };
    case ComponentType.Weight:
      return { weight: 70 };
    case ComponentType.Comparison:
      return { 
        title: "Comparação de opções",
        items: [
          { id: crypto.randomUUID(), name: "Opção A", value: 100, color: "#22c55e" },
          { id: crypto.randomUUID(), name: "Opção B", value: 30, color: "#ef4444" }
        ],
        showDetailedComparison: false,
        comparisonMetrics: [
          { id: crypto.randomUUID(), name: "Nível de interação", valueA: 100, valueB: 10 },
          { id: crypto.randomUUID(), name: "Taxa de conversão", valueA: 76, valueB: 31 }
        ]
      };
    case ComponentType.Arguments:
      return { 
        title: "Principais benefícios",
        description: "Descubra o que nosso produto pode fazer por você",
        showCheckmarks: true,
        style: {
          titleAlign: "center",
          descriptionAlign: "center",
          checkmarkColor: "#22c55e"
        },
        arguments: [
          { id: crypto.randomUUID(), text: "Melhora a produtividade em até 40%" },
          { id: crypto.randomUUID(), text: "Reduz custos operacionais" },
          { id: crypto.randomUUID(), text: "Fácil de implementar e usar" },
          { id: crypto.randomUUID(), text: "Suporte técnico 24/7" }
        ]
      };
    case ComponentType.Rating:
      return { 
        title: "Avalie sua experiência",
        description: "Nos diga o que você achou",
        rating: 3,
        maxRating: 5,
        interactive: true,
        minLabel: "Ruim",
        maxLabel: "Excelente",
        style: {
          titleAlignment: "center",
          starColor: "#FFD700",
          starSize: "medium",
          showLabels: true
        }
      };
    case ComponentType.Graphics:
      return { 
        title: "Gráfico",
        description: "Visualização de dados",
        chartType: "bar",
        chartData: [
          { name: "Categoria A", value: 400, color: "#8B5CF6" },
          { name: "Categoria B", value: 300, color: "#0EA5E9" },
          { name: "Categoria C", value: 200, color: "#F97316" },
          { name: "Categoria D", value: 100, color: "#D946EF" }
        ],
        showLegend: true,
        showTooltip: true,
        showGrid: true,
        showLabels: true,
        style: {
          titleAlign: "center",
          descriptionAlign: "center"
        }
      };
    case ComponentType.Testimonials:
      return { 
        title: "O que nossos clientes dizem",
        style: {
          displayStyle: "rectangular",
          titleAlignment: "center",
          backgroundColor: "white",
          borderColor: "#e5e7eb"
        },
        testimonials: [
          { 
            id: crypto.randomUUID(), 
            name: "Maria Silva", 
            role: "Empreendedora",
            text: "Este produto mudou completamente a forma como trabalho. Muito mais produtividade!", 
            rating: 5
          }
        ]
      };
    case ComponentType.Level:
      return { 
        title: "Nível de Experiência", 
        value: 3, 
        maxValue: 5, 
        valueDescription: "Avalie seu nível de experiência",
        style: {
          primaryColor: "#8B5CF6",
          titleAlignment: "center",
          showLabels: true,
          showPercentage: false
        }
      };
    case ComponentType.Capture:
      return { 
        title: "Inscreva-se na nossa newsletter", 
        description: "Receba as últimas atualizações diretamente na sua caixa de entrada.",
        captureFields: [
          {
            id: crypto.randomUUID(),
            type: "email",
            placeholder: "Seu endereço de email"
          }
        ],
        buttonText: "Inscrever-se",
        successMessage: "Obrigado por se inscrever!",
        navigation: {
          type: "next",
          stepId: "",
          url: "",
          openInNewTab: false
        },
        facebookEvent: "",
        facebookCustomEventName: "",
        facebookEventParams: {},
        facebookEventDebugMode: false,
        style: {
          primaryColor: "#8B5CF6",
          titleAlignment: "center"
        }
      };
    case ComponentType.Loading:
      return { 
        title: "Carregando...", 
        description: "Por favor, aguarde enquanto processamos sua solicitação.",
        style: {
          loadingStyle: "spinner",
          primaryColor: "#8B5CF6",
          titleAlignment: "center",
          size: "medium"
        }
      };
    case ComponentType.Cartesian:
      return {
        title: "Nível de sucesso com a LeadFlux",
        xAxisLabel: "Baixo",
        yAxisLabel: "Alto",
        lowerLabel: "Sem a LeadFlux",
        upperLabel: "Com a LeadFlux",
        showComparison: true,
        lowerLabelPosition: { x: 10, y: 75 },
        upperLabelPosition: { x: 90, y: 15 },
        chartPoints: [
          { x: 0, y: 2, label: "Sem a LeadFlux" },
          { x: 1, y: 3 },
          { x: 2, y: 4 },
          { x: 3, y: 6 },
          { x: 4, y: 9 },
          { x: 5, y: 11, label: "Com a LeadFlux" }
        ],
        comparisonData: [
          {
            title: "Nível de Faturamento",
            leftLabel: "Médio",
            leftValue: 50,
            rightLabel: "Alto",
            rightValue: 90,
          },
          {
            title: "Nível de Lucro",
            leftLabel: "Baixo",
            leftValue: 25,
            rightLabel: "Alto", 
            rightValue: 70,
          },
          {
            title: "Taxa de conversão",
            leftLabel: "Baixa",
            leftValue: 31,
            rightLabel: "Alta",
            rightValue: 76,
          }
        ]
      };
    case ComponentType.Spacer:
      return { height: 50 };
    case ComponentType.Video:
      return { 
        title: "Vídeo",
        videoUrl: "",
        videoType: "url", // url, iframe, js
        aspectRatio: "16:9",
        autoPlay: false,
        muted: true,
        controls: true,
        loop: false,
        alignment: "center"
      };
    case ComponentType.Price:
      return {
        title: "Planos de Preço",
        displayStyle: "cards", // alterado para cards por padrão
        alignment: "center", // left, center, right
        backgroundColor: "#151515",
        boxShadow: "lg", // lg, md, sm, none
        plans: [
          {
            id: crypto.randomUUID(),
            title: "Básico",
            description: "Para quem está começando",
            price: "99,00",
            oldPrice: "149,00",
            discount: "33% off",
            buttonText: "Escolher plano",
            features: [
              { id: crypto.randomUUID(), text: "Acesso a recursos básicos" },
              { id: crypto.randomUUID(), text: "Suporte por email" },
              { id: crypto.randomUUID(), text: "Até 5 projetos" }
            ],
            isHighlighted: false,
            style: {
              backgroundColor: "#000000",
              textColor: "#ffffff",
              buttonColor: "#6B7280",
              buttonTextColor: "#ffffff",
              featureColor: "#ffffff",
              circleColor: "#22c55e",
              borderRadius: 8,
              borderColor: "#333333"
            }
          },
          {
            id: crypto.randomUUID(),
            title: "Pro",
            description: "Recursos avançados",
            price: "197,00",
            oldPrice: "240,00",
            discount: "50% off",
            buttonText: "Escolher plano",
            features: [
              { id: crypto.randomUUID(), text: "Recursos básicos" },
              { id: crypto.randomUUID(), text: "Suporte prioritário" },
              { id: crypto.randomUUID(), text: "Projetos ilimitados" },
              { id: crypto.randomUUID(), text: "Recursos premium" }
            ],
            isHighlighted: true,
            style: {
              backgroundColor: "#000000",
              textColor: "#ffffff",
              buttonColor: "#8B5CF6",
              buttonTextColor: "#ffffff",
              featureColor: "#ffffff",
              circleColor: "#22c55e",
              borderRadius: 8,
              borderColor: "#333333"
            }
          },
          {
            id: crypto.randomUUID(),
            title: "Enterprise",
            description: "Para grandes empresas",
            price: "497,00",
            oldPrice: "",
            discount: "",
            buttonText: "Falar com vendas",
            features: [
              { id: crypto.randomUUID(), text: "Tudo no plano Pro" },
              { id: crypto.randomUUID(), text: "Suporte 24/7" },
              { id: crypto.randomUUID(), text: "Equipe dedicada" },
              { id: crypto.randomUUID(), text: "Recursos exclusivos" },
              { id: crypto.randomUUID(), text: "SLA garantido" }
            ],
            isHighlighted: false,
            style: {
              backgroundColor: "#000000",
              textColor: "#ffffff",
              buttonColor: "#0EA5E9",
              buttonTextColor: "#ffffff",
              featureColor: "#ffffff",
              circleColor: "#22c55e",
              borderRadius: 8,
              borderColor: "#333333"
            }
          }
        ]
      };
    default:
      return {};
  }
};

export const testimonialDefaultSettings = {
  title: "O que nossos clientes dizem",
  testimonials: [
    {
      id: crypto.randomUUID(),
      name: "Maria Silva",
      role: "CEO / Empresa ABC",
      text: "Este produto revolucionou a maneira como trabalhamos. Economizamos tempo e conseguimos resultados incríveis!",
      rating: 5
    }
  ],
  style: {
    displayStyle: "rectangular",
    titleAlignment: "center",
    backgroundColor: "white",
    borderColor: "#e5e7eb"
  }
};

export const getExampleElements = (): CanvasElement[] => {
  return [
    {
      id: crypto.randomUUID(),
      type: ComponentType.Text,
      content: { 
        title: "Você distrai facilmente?"
      }
    },
    {
      id: crypto.randomUUID(),
      type: ComponentType.MultipleChoice,
      content: { 
        options: [
          { id: crypto.randomUUID(), text: "Distrai-se facilmente", emoji: "😵" },
          { id: crypto.randomUUID(), text: "Ocasionalmente, perde a concentração", emoji: "😊" },
          { id: crypto.randomUUID(), text: "Raramente perde a concentração", emoji: "🙂" },
          { id: crypto.randomUUID(), text: "Muito concentrado", emoji: "🧐" },
        ]
      }
    },
    {
      id: crypto.randomUUID(),
      type: ComponentType.Button,
      content: { buttonText: "Continuar" }
    }
  ];
};
