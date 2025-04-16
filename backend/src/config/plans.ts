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
    monthlyPriceId: 'price_1R9TiMDhXX7mjDi1oB9L85fO',
    annualPriceId: 'price_1R9TxVDhXX7mjDi1Bqqo2c7N',
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
    monthlyPriceId: 'price_1R9TlvDhXX7mjDi1B0P8TotW',
    annualPriceId: 'price_1R9TxxDhXX7mjDi1Srfwxp9C',
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
    monthlyPriceId: 'price_1R9ToiDhXX7mjDi1uPJA0ae8',
    annualPriceId: 'price_1R9TyIDhXX7mjDi1LZXwlLcm',
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
    monthlyPriceId: 'price_1R9TsCDhXX7mjDi1ceAdxFyj',
    annualPriceId: 'price_1R9TypDhXX7mjDi1Mylgmedw',
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