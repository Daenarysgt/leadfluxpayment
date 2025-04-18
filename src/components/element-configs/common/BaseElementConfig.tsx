import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import MarginTopConfig from "./MarginTopConfig";
import { CanvasElement } from "@/types/canvasTypes";

interface BaseElementConfigProps {
  element: CanvasElement;
  onChange: (element: CanvasElement) => void;
  children: ReactNode;
  contentTabs?: Array<{
    value: string;
    label: string;
    content: ReactNode;
  }>;
  styleTabs?: Array<{
    value: string;
    label: string;
    content: ReactNode;
  }>;
  showMarginConfig?: boolean;
}

const BaseElementConfig = ({
  element,
  onChange,
  children,
  contentTabs,
  styleTabs,
  showMarginConfig = true
}: BaseElementConfigProps) => {
  const handleMarginTopChange = (marginTop: number) => {
    const updatedContent = {
      ...element.content,
      marginTop
    };
    
    onChange({
      ...element,
      content: updatedContent
    });
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <Tabs defaultValue="content">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="style">Estilo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            {children}
            
            {contentTabs?.map(tab => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.content}
              </TabsContent>
            ))}
          </TabsContent>
          
          <TabsContent value="style" className="space-y-4">
            {showMarginConfig && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Espaçamento</h3>
                <MarginTopConfig
                  value={element.content?.marginTop}
                  onChange={handleMarginTopChange}
                />
              </div>
            )}
            
            {styleTabs?.map(tab => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.content}
              </TabsContent>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BaseElementConfig; 