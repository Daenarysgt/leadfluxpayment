import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { Badge } from "@/components/ui/badge";

const CartesianRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content = {} } = element;
  
  // Add console log to debug CartesianRenderer rendering
  console.log("CartesianRenderer - Rendering with element:", element);
  
  // Get chart settings or use defaults
  const title = content?.title || "Nível de sucesso com a LeadFlux";
  const xAxisLabel = content?.xAxisLabel || "Baixo";
  const yAxisLabel = content?.yAxisLabel || "Alto";
  const lowerLabel = content?.lowerLabel || "Sem a LeadFlux";
  const upperLabel = content?.upperLabel || "Com a LeadFlux";
  const showComparison = content?.showComparison !== false;
  
  // Get custom positioning for labels (or use defaults)
  const lowerLabelPosition = content?.lowerLabelPosition || { x: 10, y: 75 };
  const upperLabelPosition = content?.upperLabelPosition || { x: 90, y: 15 };
  
  // Get custom chart data points or use defaults
  const chartPoints = content?.chartPoints || [
    { x: 0, y: 2, label: lowerLabel },
    { x: 1, y: 3 },
    { x: 2, y: 4 },
    { x: 3, y: 6 },
    { x: 4, y: 9 },
    { x: 5, y: 11, label: upperLabel }
  ];
  
  // Data for comparison metrics
  const comparisonData = content?.comparisonData || [
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
  ];

  // Custom gradient for the chart
  const gradientId = `linearGradient-${element.id}`;
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4 w-full">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
        
        <div className="h-64 w-full mb-8 relative">
          <svg width="0" height="0">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="25%" stopColor="#FFD166" />
                <stop offset="50%" stopColor="#F9F871" />
                <stop offset="75%" stopColor="#91E4A5" />
                <stop offset="100%" stopColor="#67E8C3" />
              </linearGradient>
            </defs>
          </svg>
          
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartPoints}
              margin={{ top: 30, right: 30, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                dataKey="x" 
                type="number" 
                domain={[0, chartPoints.length > 0 ? chartPoints.length - 1 : 5]}
                hide 
              />
              <YAxis 
                type="number" 
                domain={[0, 'dataMax']}
                hide
              />
              <Tooltip 
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    if (data.label) {
                      return (
                        <div className="p-2 bg-background border rounded shadow-md">
                          <Badge variant="outline" className="font-medium">
                            {data.label}
                          </Badge>
                        </div>
                      );
                    }
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke={`url(#${gradientId})`}
                strokeWidth={6}
                dot={false}
                activeDot={false}
              />
              
              {/* Reference dots for each point */}
              {chartPoints.map((point, index) => (
                <ReferenceDot
                  key={index}
                  x={point.x}
                  y={point.y}
                  r={index === 0 || index === chartPoints.length - 1 ? 6 : 5}
                  fill="#FFF"
                  stroke={getPointColor(index, chartPoints.length)}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          
          {/* Label overlays */}
          <div className="absolute left-0 bottom-[-30px] text-sm text-gray-600 font-medium">
            {xAxisLabel}
          </div>
          
          <div className="absolute right-0 bottom-[-30px] text-sm text-gray-600 font-medium">
            {yAxisLabel}
          </div>
          
          {/* Custom positioned labels for reference points */}
          <div 
            className="absolute bg-white px-3 py-1 rounded-full border shadow-sm text-sm"
            style={{
              left: `${lowerLabelPosition.x}%`,
              top: `${lowerLabelPosition.y}%`
            }}
          >
            {lowerLabel}
          </div>
          
          <div 
            className="absolute bg-[#0f172a] text-white px-3 py-1 rounded-full shadow-sm text-sm"
            style={{
              right: `${100 - upperLabelPosition.x}%`,
              top: `${upperLabelPosition.y}%`
            }}
          >
            {upperLabel}
          </div>
        </div>
        
        {/* Comparison metrics */}
        {showComparison && (
          <div className="space-y-6 mt-10">
            {comparisonData.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.leftValue}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${item.leftValue}%`,
                        backgroundColor: item.leftColor || "#FF6B6B"
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.leftLabel}</div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.rightValue}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${item.rightValue}%`,
                        backgroundColor: item.rightColor || "#67E8C3"
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.rightLabel}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

// Helper function to get point color based on position
const getPointColor = (index: number, total: number) => {
  const colors = [
    "#FF6B6B", // Red
    "#FF9066", // Orange-red
    "#FFD166", // Yellow
    "#CBDE6C", // Yellow-green
    "#91E4A5", // Light green
    "#67E8C3"  // Teal
  ];
  
  if (total <= 1) return colors[0];
  
  // Map index to color index
  const colorIndex = Math.min(
    Math.floor((index / (total - 1)) * (colors.length - 1)),
    colors.length - 1
  );
  
  return colors[colorIndex];
};

export default CartesianRenderer;
