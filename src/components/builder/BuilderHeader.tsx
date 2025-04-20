import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Monitor, Smartphone, Eye, Save, LayoutGrid, Palette, Settings as SettingsIcon, ChevronLeft, ExternalLink, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";

interface BuilderHeaderProps {
  funnelName: string;
  funnelId: string;
  viewMode: "desktop" | "mobile";
  previewActive: boolean;
  onTogglePreview: () => void;
  onViewModeChange: (mode: "desktop" | "mobile") => void;
  onSave: () => void;
  onOpenFullPreview: () => void;
  useScaledUI?: boolean;
  onToggleScaledUI?: () => void;
}

const BuilderHeader = ({
  funnelName,
  funnelId,
  viewMode,
  previewActive,
  onTogglePreview,
  onViewModeChange,
  onSave,
  onOpenFullPreview,
  useScaledUI = true,
  onToggleScaledUI
}: BuilderHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b py-2 px-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100" onClick={() => navigate("/dashboard")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LeadFlux</h1>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <span className="text-sm text-gray-600">{funnelName}</span>
      </div>

      <div className="flex items-center gap-3">
        <Tabs defaultValue="construtor" className="w-auto">
          <TabsList className="h-8 bg-gray-100 p-0.5">
            <TabsTrigger 
              value="construtor" 
              className="text-xs px-3 h-7 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-transparent data-[state=active]:bg-clip-text"
              onClick={() => onTogglePreview()}
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
              Construtor
            </TabsTrigger>
            <TabsTrigger 
              value="design" 
              className="text-xs px-3 h-7 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-transparent data-[state=active]:bg-clip-text"
              onClick={() => navigate(`/design/${funnelId}`)}
            >
              <Palette className="h-3.5 w-3.5 mr-1.5" />
              Design
            </TabsTrigger>
            <TabsTrigger 
              value="configuracoes" 
              className="text-xs px-3 h-7 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-transparent data-[state=active]:bg-clip-text"
              onClick={() => navigate(`/settings/${funnelId}`)}
            >
              <SettingsIcon className="h-3.5 w-3.5 mr-1.5" />
              Configurações
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-8 px-3 rounded-r-none border border-r-0",
              viewMode === 'desktop' ? 'bg-gray-100 text-violet-700' : 'text-gray-600'
            )}
            onClick={() => onViewModeChange("desktop")}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-8 px-3 rounded-l-none border",
              viewMode === 'mobile' ? 'bg-gray-100 text-violet-700' : 'text-gray-600'
            )}
            onClick={() => onViewModeChange("mobile")}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
        
        {onToggleScaledUI && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-violet-700"
            onClick={onToggleScaledUI}
            title={useScaledUI ? "Visualização normal (100%)" : "Visualização compacta (85%)"}
          >
            {useScaledUI ? <ZoomIn className="h-4 w-4" /> : <ZoomOut className="h-4 w-4" />}
            {useScaledUI ? "100%" : "85%"}
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 bg-black text-white border-black hover:bg-gray-900"
          onClick={onOpenFullPreview}
        >
          <ExternalLink className="h-4 w-4" />
          Abrir Prévia
        </Button>
        
        <Button 
          variant={previewActive ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 gap-1",
            previewActive && "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
          )}
          onClick={onTogglePreview}
        >
          <Eye className="h-4 w-4" />
          {previewActive ? "Voltar" : "Visualizar"}
        </Button>
        
        <Button 
          size="sm" 
          className="h-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-1"
          onClick={onSave}
        >
          <Save className="h-3.5 w-3.5" />
          Salvar
        </Button>
      </div>
    </header>
  );
};

export default BuilderHeader;
