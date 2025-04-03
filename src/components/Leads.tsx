import { useState } from 'react';
import { accessService } from '../services/accessService';

interface LeadInteraction {
  status: string;
  type: 'click' | 'choice';
  value?: string | null;
  timestamp: Date;
}

interface Lead {
  sessionId: string;
  firstInteraction: Date;
  interactions: {
    [stepNumber: string]: LeadInteraction;
  };
}

interface LeadsProps {
  funnelId: string;
  period: 'all' | 'today' | '7days' | '30days';
}

export function Leads({ funnelId, period }: LeadsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const leads = await accessService.getFunnelLeadsWithInteractions(funnelId, period);
      const formattedLeads = leads.map(lead => ({
        sessionId: lead.sessionId,
        firstInteraction: new Date(lead.firstInteraction),
        interactions: Object.entries(lead.interactions).reduce((acc, [stepNumber, interaction]) => {
          acc[stepNumber] = {
            status: interaction.status,
            type: interaction.type || 'click',
            value: interaction.value || null,
            timestamp: new Date(interaction.timestamp)
          };
          return acc;
        }, {} as Lead['interactions'])
      }));
      setLeads(formattedLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... existing code ...
} 