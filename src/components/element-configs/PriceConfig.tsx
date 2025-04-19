import { useState, useEffect } from "react";
import { CanvasElement } from "@/types/canvasTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "./common/ColorPicker";
import { ConfigLabel } from "./common/ConfigLabel";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, PlusCircle, ArrowUp, ArrowDown, Star, PanelLeft, LayoutGrid, AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

interface PriceConfigProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

const PriceConfig = ({ element, onUpdate }: PriceConfigProps) => {
  const content = element.content || {};
  
  const updateContent = (newContentProps: any) => {
    onUpdate({
      content: {
        ...content,
        ...newContentProps
      }
    });
  };

  // Adicionar um novo plano
  const addPlan = () => {
    const plans = [...(content.plans || [])];
    
    // Criar um novo plano com valores padrão
    const newPlan = {
      id: uuidv4(),
      title: "Novo Plano",
      description: "Descrição do plano",
      price: "99,00",
      oldPrice: "",
      discount: "",
      buttonText: "Escolher este plano",
      showButton: true,
      features: [
        { id: uuidv4(), text: "Recurso 1" },
        { id: uuidv4(), text: "Recurso 2" },
        { id: uuidv4(), text: "Recurso 3" }
      ],
      isHighlighted: false,
      style: {
        backgroundColor: "#000000",
        textColor: "#ffffff",
        buttonColor: "#8B5CF6",
        buttonTextColor: "#ffffff",
        featureColor: "#ffffff",
        circleColor: "#32CD32",
        borderRadius: 8,
        borderColor: "#333333"
      }
    };
    
    plans.push(newPlan);
    updateContent({ plans });
  };

  // Remover um plano
  const removePlan = (planId: string) => {
    const plans = (content.plans || []).filter(plan => plan.id !== planId);
    updateContent({ plans });
  };

  // Adicionar um recurso a um plano
  const addFeature = (planId: string) => {
    const plans = [...(content.plans || [])];
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
      const plan = { ...plans[planIndex] };
      const features = [...(plan.features || [])];
      
      features.push({
        id: uuidv4(),
        text: "Novo recurso"
      });
      
      plan.features = features;
      plans[planIndex] = plan;
      updateContent({ plans });
    }
  };

  // Remover um recurso de um plano
  const removeFeature = (planId: string, featureId: string) => {
    const plans = [...(content.plans || [])];
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
      const plan = { ...plans[planIndex] };
      const features = (plan.features || []).filter(feature => feature.id !== featureId);
      
      plan.features = features;
      plans[planIndex] = plan;
      updateContent({ plans });
    }
  };

  // Mover um plano para cima ou para baixo
  const movePlan = (planId: string, direction: 'up' | 'down') => {
    const plans = [...(content.plans || [])];
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
      if (direction === 'up' && planIndex > 0) {
        const temp = plans[planIndex];
        plans[planIndex] = plans[planIndex - 1];
        plans[planIndex - 1] = temp;
      } else if (direction === 'down' && planIndex < plans.length - 1) {
        const temp = plans[planIndex];
        plans[planIndex] = plans[planIndex + 1];
        plans[planIndex + 1] = temp;
      }
      
      updateContent({ plans });
    }
  };

  // Atualizar um plano específico
  const updatePlan = (planId: string, updates: any) => {
    const plans = [...(content.plans || [])];
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
      plans[planIndex] = {
        ...plans[planIndex],
        ...updates
      };
      
      updateContent({ plans });
    }
  };

  // Atualizar um estilo de plano específico
  const updatePlanStyle = (planId: string, styleUpdates: any) => {
    const plans = [...(content.plans || [])];
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
      const plan = { ...plans[planIndex] };
      const style = { ...plan.style, ...styleUpdates };
      
      plan.style = style;
      plans[planIndex] = plan;
      updateContent({ plans });
    }
  };

  // Atualizar um recurso específico
  const updateFeature = (planId: string, featureId: string, updates: any) => {
    const plans = [...(content.plans || [])];
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
      const plan = { ...plans[planIndex] };
      const features = [...(plan.features || [])];
      const featureIndex = features.findIndex(feature => feature.id === featureId);
      
      if (featureIndex !== -1) {
        features[featureIndex] = {
          ...features[featureIndex],
          ...updates
        };
        
        plan.features = features;
        plans[planIndex] = plan;
        updateContent({ plans });
      }
    }
  };

  // Destacar/desdestaque de um plano
  const toggleHighlight = (planId: string) => {
    const plans = [...(content.plans || [])];
    
    // Primeiro, remova o destaque de todos os planos
    plans.forEach(plan => {
      plan.isHighlighted = false;
    });
    
    // Então, destaque apenas o plano selecionado
    const planIndex = plans.findIndex(plan => plan.id === planId);
    if (planIndex !== -1) {
      plans[planIndex].isHighlighted = true;
      updateContent({ plans });
    }
  };

  return (
    <Tabs defaultValue="conteudo" className="w-full">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="conteudo" className="flex-1">Conteúdo</TabsTrigger>
        <TabsTrigger value="estilo" className="flex-1">Estilo</TabsTrigger>
        <TabsTrigger value="planos" className="flex-1">Planos</TabsTrigger>
      </TabsList>

      {/* Aba de Conteúdo */}
      <TabsContent value="conteudo" className="space-y-4">
        <div>
          <ConfigLabel htmlFor="price-title">Título</ConfigLabel>
          <Input
            id="price-title"
            value={content.title || ""}
            onChange={e => updateContent({ title: e.target.value })}
            placeholder="Planos de Preço"
          />
        </div>
        
        <div>
          <ConfigLabel>Estilo de exibição</ConfigLabel>
          <div className="flex space-x-2 mt-1.5">
            <Button 
              type="button" 
              variant={content.displayStyle === "horizontal" ? "default" : "outline"}
              size="sm"
              onClick={() => updateContent({ displayStyle: "horizontal" })}
              className="flex-1"
            >
              <PanelLeft className="h-4 w-4 mr-2" /> Horizontal
            </Button>
            <Button 
              type="button" 
              variant={content.displayStyle === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => updateContent({ displayStyle: "cards" })}
              className="flex-1"
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> Cards
            </Button>
          </div>
        </div>
        
        <div>
          <ConfigLabel>Alinhamento</ConfigLabel>
          <RadioGroup 
            value={content.alignment || "center"}
            onValueChange={value => updateContent({ alignment: value })}
            className="flex space-x-2 pt-1.5"
          >
            <div className="flex items-center space-x-1 flex-1">
              <RadioGroupItem value="left" id="align-left" />
              <Label htmlFor="align-left" className="flex items-center cursor-pointer">
                <AlignLeft className="h-4 w-4 mr-1" /> Esquerda
              </Label>
            </div>
            <div className="flex items-center space-x-1 flex-1">
              <RadioGroupItem value="center" id="align-center" />
              <Label htmlFor="align-center" className="flex items-center cursor-pointer">
                <AlignCenter className="h-4 w-4 mr-1" /> Centro
              </Label>
            </div>
            <div className="flex items-center space-x-1 flex-1">
              <RadioGroupItem value="right" id="align-right" />
              <Label htmlFor="align-right" className="flex items-center cursor-pointer">
                <AlignRight className="h-4 w-4 mr-1" /> Direita
              </Label>
            </div>
          </RadioGroup>
        </div>
      </TabsContent>

      {/* Aba de Estilo */}
      <TabsContent value="estilo" className="space-y-4">
        <div>
          <ConfigLabel>Cor de fundo (padrão)</ConfigLabel>
          <ColorPicker
            value={content.backgroundColor || "#151515"}
            onChange={color => updateContent({ backgroundColor: color })}
          />
        </div>
        
        <div>
          <ConfigLabel>Sombra</ConfigLabel>
          <Select
            value={content.boxShadow || "lg"}
            onValueChange={value => updateContent({ boxShadow: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tamanho da sombra" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              <SelectItem value="sm">Pequena</SelectItem>
              <SelectItem value="md">Média</SelectItem>
              <SelectItem value="lg">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TabsContent>

      {/* Aba de Planos */}
      <TabsContent value="planos" className="space-y-4">
        {/* Lista de planos */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {(content.plans || []).map((plan, index) => (
            <div 
              key={plan.id}
              className="border rounded-md p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center">
                  {plan.isHighlighted && <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />}
                  Plano {index + 1}
                </h4>
                <div className="flex space-x-1">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7"
                    onClick={() => movePlan(plan.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7"
                    onClick={() => movePlan(plan.id, 'down')}
                    disabled={index === (content.plans || []).length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removePlan(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="w-full mb-2">
                  <TabsTrigger value="info" className="flex-1 text-xs">Informações</TabsTrigger>
                  <TabsTrigger value="features" className="flex-1 text-xs">Recursos</TabsTrigger>
                  <TabsTrigger value="style" className="flex-1 text-xs">Estilo</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-3">
                  <div>
                    <Label className="text-xs" htmlFor={`plan-title-${plan.id}`}>Título</Label>
                    <Input
                      id={`plan-title-${plan.id}`}
                      value={plan.title}
                      onChange={e => updatePlan(plan.id, { title: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs" htmlFor={`plan-description-${plan.id}`}>Descrição</Label>
                    <Textarea
                      id={`plan-description-${plan.id}`}
                      value={plan.description}
                      onChange={e => updatePlan(plan.id, { description: e.target.value })}
                      className="text-sm resize-none h-16"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs" htmlFor={`plan-price-${plan.id}`}>Preço</Label>
                      <Input
                        id={`plan-price-${plan.id}`}
                        value={plan.price}
                        onChange={e => updatePlan(plan.id, { price: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="199,00"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs" htmlFor={`plan-old-price-${plan.id}`}>Preço antigo</Label>
                      <Input
                        id={`plan-old-price-${plan.id}`}
                        value={plan.oldPrice || ""}
                        onChange={e => updatePlan(plan.id, { oldPrice: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="299,00"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs" htmlFor={`plan-discount-${plan.id}`}>Desconto</Label>
                      <Input
                        id={`plan-discount-${plan.id}`}
                        value={plan.discount || ""}
                        onChange={e => updatePlan(plan.id, { discount: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="50% off"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs" htmlFor={`plan-button-text-${plan.id}`}>Texto do botão</Label>
                      <Input
                        id={`plan-button-text-${plan.id}`}
                        value={plan.buttonText || ""}
                        onChange={e => updatePlan(plan.id, { buttonText: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="Escolher plano"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2 pt-1">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`plan-highlight-${plan.id}`}
                        checked={!!plan.isHighlighted}
                        onCheckedChange={() => toggleHighlight(plan.id)}
                      />
                      <Label htmlFor={`plan-highlight-${plan.id}`} className="text-xs flex items-center">
                        <Star className="h-3 w-3 mr-1" /> Destacar este plano
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`plan-show-button-${plan.id}`}
                        checked={plan.showButton !== false}
                        onCheckedChange={(checked) => updatePlan(plan.id, { showButton: checked })}
                      />
                      <Label htmlFor={`plan-show-button-${plan.id}`} className="text-xs">
                        Mostrar botão
                      </Label>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="features" className="space-y-3">
                  {(plan.features || []).map((feature, featureIndex) => (
                    <div key={feature.id} className="flex space-x-2">
                      <Input
                        value={feature.text}
                        onChange={e => updateFeature(plan.id, feature.id, { text: e.target.value })}
                        className="h-8 text-sm"
                        placeholder={`Recurso ${featureIndex + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive"
                        onClick={() => removeFeature(plan.id, feature.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => addFeature(plan.id)}
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" /> Adicionar recurso
                  </Button>
                </TabsContent>
                
                <TabsContent value="style" className="space-y-3">
                  <div>
                    <Label className="text-xs">Cor de fundo</Label>
                    <ColorPicker
                      value={plan.style?.backgroundColor || "#000000"}
                      onChange={color => updatePlanStyle(plan.id, { backgroundColor: color })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Cor do texto</Label>
                    <ColorPicker
                      value={plan.style?.textColor || "#ffffff"}
                      onChange={color => updatePlanStyle(plan.id, { textColor: color })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Cor do botão</Label>
                    <ColorPicker
                      value={plan.style?.buttonColor || "#8B5CF6"}
                      onChange={color => updatePlanStyle(plan.id, { buttonColor: color })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Cor do texto do botão</Label>
                    <ColorPicker
                      value={plan.style?.buttonTextColor || "#ffffff"}
                      onChange={color => updatePlanStyle(plan.id, { buttonTextColor: color })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Cor do indicador</Label>
                    <ColorPicker
                      value={plan.style?.circleColor || "#32CD32"}
                      onChange={color => updatePlanStyle(plan.id, { circleColor: color })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Raio da borda</Label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={plan.style?.borderRadius || 8}
                      onChange={e => updatePlanStyle(plan.id, { borderRadius: parseInt(e.target.value, 10) })}
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Cor da borda</Label>
                    <ColorPicker
                      value={plan.style?.borderColor || "#333333"}
                      onChange={color => updatePlanStyle(plan.id, { borderColor: color })}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ))}
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={addPlan}
          className="w-full"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Adicionar novo plano
        </Button>
      </TabsContent>
    </Tabs>
  );
};

export default PriceConfig; 