import React from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

// Tipos auxiliares para o componente
type ChartType = "bar" | "pie" | "line";
type ChartData = { name: string; value: number; color?: string }[];

const GraphicsRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;
  
  const title = content?.title !== undefined ? content.title : "Gráfico";
  const description = content?.description || "";
  const chartType = content?.chartType || "bar";
  const valueLabel = content?.valueLabel || "value";
  
  // Fix for chartData structure - transform the data if it's in the old format
  let chartData: ChartData = [];
  
  if (content?.chartData) {
    // Handle the case where chartData is already in the correct format
    if (Array.isArray(content.chartData)) {
      chartData = content.chartData;
    } 
    // Handle the older format with labels and values arrays
    else if (content.chartData.labels && Array.isArray(content.chartData.labels)) {
      chartData = content.chartData.labels.map((label: string, index: number) => ({
        name: label,
        value: content.chartData.values[index] || 0,
      }));
    }
    // Default empty data if format is unknown
    else {
      chartData = getDefaultData();
    }
  } else {
    chartData = getDefaultData();
  }
  
  // Transforma os dados para usar o rótulo personalizado
  const processedData = chartData.map(item => ({
    ...item,
    [valueLabel]: item.value,
  }));
  
  const style = content?.style || {};
  const showLegend = content?.showLegend !== false;
  const showTooltip = content?.showTooltip !== false;
  const showGrid = content?.showGrid !== false;
  const showLabels = content?.showLabels !== false;
  
  // Configuração das cores baseadas no estilo ou cores padrão
  const chartColors = {
    bar: style?.barColor || "#8B5CF6",
    line: style?.lineColor || "#0EA5E9",
    pie: chartData.map((item) => item.color || getRandomColor(item.name)),
  };
  
  // Configuração específica para cada tipo de gráfico
  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ChartContainer 
            className="w-full aspect-video max-h-80"
            config={{
              [valueLabel]: { label: valueLabel || "Valor", color: chartColors.bar },
            }}
          >
            <BarChart data={processedData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              {showLabels && <YAxis />}
              {showTooltip && (
                <Tooltip 
                  content={
                    <ChartTooltipContent 
                      labelKey="name" 
                      nameKey={valueLabel !== "" ? valueLabel : undefined}
                    />
                  } 
                />
              )}
              {showLegend && <Legend />}
              <Bar 
                dataKey={valueLabel || "value"} 
                fill={chartColors.bar} 
                radius={[4, 4, 0, 0]} 
                barSize={30}
                animationDuration={750}
                name={valueLabel || "Valor"}
              />
            </BarChart>
          </ChartContainer>
        );
      
      case "pie":
        return (
          <ChartContainer 
            className="w-full aspect-video max-h-80"
            config={{
              [valueLabel]: { label: valueLabel || "Valor", color: chartColors.line },
              ...processedData.reduce((acc, item, index) => {
                acc[item.name] = { 
                  label: item.name, 
                  color: item.color || chartColors.pie[index] 
                };
                return acc;
              }, {} as any)
            }}
          >
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={showLabels}
                outerRadius={80}
                innerRadius={style?.donut ? 40 : 0}
                dataKey={valueLabel || "value"}
                animationDuration={750}
                nameKey="name"
                name={valueLabel || "Valor"}
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || chartColors.pie[index]}
                  />
                ))}
              </Pie>
              {showTooltip && (
                <Tooltip 
                  content={
                    <ChartTooltipContent 
                      labelKey="name" 
                      nameKey={valueLabel !== "" ? valueLabel : undefined}
                    />
                  } 
                />
              )}
              {showLegend && <Legend />}
            </PieChart>
          </ChartContainer>
        );
      
      case "line":
        return (
          <ChartContainer 
            className="w-full aspect-video max-h-80"
            config={{
              [valueLabel]: { label: valueLabel || "Valor", color: chartColors.line },
            }}
          >
            <LineChart data={processedData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              {showLabels && <YAxis />}
              {showTooltip && (
                <Tooltip 
                  content={
                    <ChartTooltipContent 
                      labelKey="name" 
                      nameKey={valueLabel !== "" ? valueLabel : undefined}
                    />
                  } 
                />
              )}
              {showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey={valueLabel || "value"}
                stroke={chartColors.line}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={750}
                name={valueLabel || "Valor"}
              />
            </LineChart>
          </ChartContainer>
        );
      
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            <p>Tipo de gráfico não suportado</p>
          </div>
        );
    }
  };

  return (
    <BaseElementRenderer {...props}>
      <div className="p-4 w-full">
        {title !== "" && (
          <h2 className={cn(
            "text-xl font-medium mb-2 text-center",
            style?.titleAlign === "left" && "text-left",
            style?.titleAlign === "right" && "text-right"
          )}>
            {title}
          </h2>
        )}
        
        {description && (
          <p className={cn(
            "text-gray-600 mb-4 text-center",
            style?.descriptionAlign === "left" && "text-left",
            style?.descriptionAlign === "right" && "text-right"
          )}>
            {description}
          </p>
        )}
        
        <div className="mt-4">
          {renderChart()}
        </div>
      </div>
    </BaseElementRenderer>
  );
};

// Funções auxiliares
function getDefaultData(): ChartData {
  return [
    { name: "Categoria A", value: 400, color: "#8B5CF6" },
    { name: "Categoria B", value: 300, color: "#0EA5E9" },
    { name: "Categoria C", value: 200, color: "#F97316" },
    { name: "Categoria D", value: 100, color: "#D946EF" },
  ];
}

function getRandomColor(seed: string): string {
  // Lista de cores vibrantes predefinidas
  const colors = [
    "#8B5CF6", // Roxo
    "#0EA5E9", // Azul
    "#F97316", // Laranja
    "#D946EF", // Rosa
    "#10B981", // Verde
    "#F59E0B", // Âmbar
    "#6366F1", // Índigo
    "#EC4899", // Rosa escuro
  ];
  
  // Usa o nome como seed para selecionar uma cor
  const index = Math.abs(seed.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0) % colors.length);
  
  return colors[index];
}

export default GraphicsRenderer;
