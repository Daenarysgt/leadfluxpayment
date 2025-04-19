export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  features: string[];
  monthlyPriceId: string;
  annualPriceId: string;
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'leadflux BASIC',
    description: 'Perfeito para começar tranquilo e atingir seus objetivos gradualmente.',
    features: [
      'Até 3 funis',
      'Até 5 mil leads na conta',
      'Componentes interativos',
      'Domínio próprio',
      'Pixel e Scripts de trackeamento',
      'Gestão e downloads dos leads'
    ],
    monthlyPriceId: 'price_1RFgPbDhXX7mjDi1zJdKZw8E',
    annualPriceId: 'price_1RFgPbDhXX7mjDi11kJr6MNN',
    popular: false
  },
  {
    id: 'pro',
    name: 'leadflux PRO',
    description: 'Para quem já tem experiência de mercado e testes de performance.',
    features: [
      'Até 6 funis',
      'Até 10 mil leads na conta',
      'Componentes interativos',
      'Webhook',
      'Domínio próprio',
      'Pixel e Scripts de trackeamento',
      'Gestão e downloads dos leads'
    ],
    monthlyPriceId: 'price_1RFgRrDhXX7mjDi1adMfarMo',
    annualPriceId: 'price_1RFgRrDhXX7mjDi1WJWWSY61',
    popular: true
  },
  {
    id: 'elite',
    name: 'leadflux ELITE',
    description: 'Feito para quem precisa de escala e possui demanda de terceiros.',
    features: [
      'Até 12 funis',
      'Até 25 mil leads na conta',
      'Componentes interativos',
      'Webhook',
      'Domínio próprio',
      'Pixel e Scripts de trackeamento',
      'Gestão e downloads dos leads',
      'Compartilhamento de funis',
      'Edição compartilhada'
    ],
    monthlyPriceId: 'price_1RFgRuDhXX7mjDi13Yhtoyhd',
    annualPriceId: 'price_1RFgRuDhXX7mjDi1fvbcV1B3',
    popular: false
  },
  {
    id: 'scale',
    name: 'leadflux SCALE',
    description: 'Perfeito para líderes do mercado que buscam inovação constante.',
    features: [
      'Até 30 funis',
      'Até 100 mil leads na conta',
      'Componentes interativos',
      'Webhook',
      'Domínio próprio',
      'Pixel e Scripts de trackeamento',
      'Gestão e downloads dos leads',
      'Suporte com video chamadas',
      'Compartilhamento de funis',
      'Edição compartilhada'
    ],
    monthlyPriceId: 'price_1RFgRvDhXX7mjDi1gGwRS62H',
    annualPriceId: 'price_1RFgRvDhXX7mjDi1Q5FkvC4n',
    popular: false
  }
];

// Interface para definir os limites de cada plano
export interface PlanLimits {
  maxFunnels: number;
  maxLeads: number;
}

// Definição dos limites para cada plano
export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxFunnels: 1,
    maxLeads: 1000
  },
  basic: {
    maxFunnels: 3,
    maxLeads: 5000
  },
  pro: {
    maxFunnels: 6,
    maxLeads: 10000
  },
  elite: {
    maxFunnels: 12,
    maxLeads: 25000
  },
  scale: {
    maxFunnels: 30,
    maxLeads: 100000
  }
}; 