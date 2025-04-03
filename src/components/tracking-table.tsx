import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrackingStep {
  name: string;
  status: string;
  buttonId?: string;
  interactionRate: number;
}

interface TrackingData {
  id: string;
  date: string;
  steps: TrackingStep[];
}

interface TrackingTableProps {
  data: TrackingData[];
}

const getInteractionColor = (rate: number) => {
  if (rate === 0) return 'bg-gray-100';
  if (rate < 30) return 'bg-red-500';
  if (rate < 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

export const TrackingTable = ({ data }: TrackingTableProps) => {
  const steps = data[0]?.steps || [];

  // Calcula a taxa de interação total para cada etapa
  const calculateTotalInteractionRate = (stepIndex: number) => {
    const totalUsers = data.length;
    const usersInteracted = data.filter(item => item.steps[stepIndex].status === 'clicked').length;
    return (usersInteracted / totalUsers) * 100;
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[50px] text-center">
                <Checkbox />
              </TableHead>
              <TableHead className="w-[120px]">Data</TableHead>
              {steps.map((step, index) => (
                <TableHead key={index} className="min-w-[180px]">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger>
                          <div className={`w-1 h-5 ${getInteractionColor(calculateTotalInteractionRate(index))}`} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Taxa de interação: {calculateTotalInteractionRate(index).toFixed(1)}%</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="font-semibold">{step.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 font-normal pl-3">
                      button: {step.buttonId}
                    </div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="text-center">
                  <Checkbox />
                </TableCell>
                <TableCell>{item.date}</TableCell>
                {item.steps.map((step, index) => (
                  <TableCell key={index} className="relative">
                    {/* Apenas mostra o status clicked */}
                    <div className="pl-8 text-sm text-gray-600">
                      {step.status === 'clicked' ? 'clicked' : ''}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  );
}; 