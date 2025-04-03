export interface FunnelAccessLog {
  id: string;
  funnel_id: string;
  step_reached: number;
  is_conversion: boolean;
  time_per_step: Record<string, number>;
  created_at: string;
  updated_at: string;
  is_first_access: boolean;
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
} 