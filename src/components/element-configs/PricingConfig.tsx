import { useState } from "react";
import { ElementConfigProps } from "@/types/canvasTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingConfigProps extends ElementConfigProps {}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "monthly" | "annual";
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
  buttonColor?: string;
  buttonVariant?: string;
}

const PricingConfig = ({ element, onUpdate }: PricingConfigProps) => {
  const content = element.content || {};
  const [activeTab, setActiveTab] = useState("general");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Extract all necessary properties with defaults
  const title = content.title || "Nossos Planos";
  const subtitle = content.subtitle || "Escolha o plano ideal para você";
  const showAnnualToggle = content.showAnnualToggle ?? true;
  const annualDiscount = content.annualDiscount || 15;
  const plans = content.plans || [];
  const alignment = content.alignment || "center";
  const theme = content.theme || "light";
  const style = content.style || "modern";

  const handleGeneralUpdate = (updates: Record<string, any>) => {
    onUpdate({
      content: {
        ...content,
        ...updates,
      },
    });
  };

  const handlePlanUpdate = (planId: string, updates: Partial<PricingPlan>) => {
    const updatedPlans = plans.map((plan: PricingPlan) =>
      plan.id === planId ? { ...plan, ...updates } : plan
    );

    onUpdate({
      content: {
        ...content,
        plans: updatedPlans,
      },
    });
  };

  const addNewPlan = () => {
    const newPlan: PricingPlan = {
      id: `plan_${Date.now()}`,
      name: "Novo Plano",
      description: "Descrição do plano",
      price: 0,
      interval: "monthly",
      features: ["Recurso 1", "Recurso 2", "Recurso 3"],
      buttonText: "Começar agora",
      buttonColor: "#000000",
      buttonVariant: "default"
    };

    onUpdate({
      content: {
        ...content,
        plans: [...plans, newPlan],
      },
    });
  };

  const removePlan = (planId: string) => {
    onUpdate({
      content: {
        ...content,
        plans: plans.filter((plan: PricingPlan) => plan.id !== planId),
      },
    });
  };

  const movePlan = (fromIndex: number, toIndex: number) => {
    const updatedPlans = [...plans];
    const [movedPlan] = updatedPlans.splice(fromIndex, 1);
    updatedPlans.splice(toIndex, 0, movedPlan);

    onUpdate({
      content: {
        ...content,
        plans: updatedPlans,
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Título e Subtítulo */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleGeneralUpdate({ title: e.target.value })}
                placeholder="Nossos Planos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => handleGeneralUpdate({ subtitle: e.target.value })}
                placeholder="Escolha o plano ideal para você"
              />
            </div>
          </div>

          <Separator />

          {/* Configurações de Preço */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="annual-toggle">Mostrar Toggle Anual/Mensal</Label>
                <p className="text-sm text-muted-foreground">
                  Permite que o usuário alterne entre preços anuais e mensais
                </p>
              </div>
              <Switch
                id="annual-toggle"
                checked={showAnnualToggle}
                onCheckedChange={(checked) => handleGeneralUpdate({ showAnnualToggle: checked })}
              />
            </div>

            {showAnnualToggle && (
              <div className="space-y-2">
                <Label htmlFor="annual-discount">Desconto Anual (%)</Label>
                <Input
                  id="annual-discount"
                  type="number"
                  min={0}
                  max={100}
                  value={annualDiscount}
                  onChange={(e) => handleGeneralUpdate({ annualDiscount: Number(e.target.value) })}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Estilo e Tema */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alignment">Alinhamento</Label>
              <Select
                value={alignment}
                onValueChange={(value) => handleGeneralUpdate({ alignment: value })}
              >
                <SelectTrigger id="alignment">
                  <SelectValue placeholder="Selecione o alinhamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select
                value={theme}
                onValueChange={(value) => handleGeneralUpdate({ theme: value })}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Selecione o tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Estilo</Label>
              <Select
                value={style}
                onValueChange={(value) => handleGeneralUpdate({ style: value })}
              >
                <SelectTrigger id="style">
                  <SelectValue placeholder="Selecione o estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Moderno</SelectItem>
                  <SelectItem value="minimal">Minimalista</SelectItem>
                  <SelectItem value="classic">Clássico</SelectItem>
                  <SelectItem value="gradient">Gradiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          {/* Lista de Planos */}
          <div className="space-y-4">
            {plans.map((plan: PricingPlan, index: number) => (
              <div
                key={plan.id}
                className={cn(
                  "border rounded-lg p-4 space-y-4",
                  editingPlanId === plan.id && "ring-2 ring-primary"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      className="cursor-move opacity-50 hover:opacity-100"
                      onMouseDown={() => setEditingPlanId(plan.id)}
                    >
                      <GripVertical className="h-5 w-5" />
                    </button>
                    <h3 className="font-medium">{plan.name}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePlan(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Plano</Label>
                    <Input
                      value={plan.name}
                      onChange={(e) =>
                        handlePlanUpdate(plan.id, { name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preço</Label>
                    <Input
                      type="number"
                      value={plan.price}
                      onChange={(e) =>
                        handlePlanUpdate(plan.id, {
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={plan.description}
                    onChange={(e) =>
                      handlePlanUpdate(plan.id, { description: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recursos (um por linha)</Label>
                  <Textarea
                    value={plan.features.join("\n")}
                    onChange={(e) =>
                      handlePlanUpdate(plan.id, {
                        features: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id={`popular-${plan.id}`}
                    checked={plan.isPopular}
                    onCheckedChange={(checked) =>
                      handlePlanUpdate(plan.id, { isPopular: checked })
                    }
                  />
                  <Label htmlFor={`popular-${plan.id}`}>Plano Popular</Label>
                </div>

                <Separator />

                {/* Configurações do Botão */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Configurações do Botão</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Texto do Botão</Label>
                      <Input
                        value={plan.buttonText}
                        onChange={(e) =>
                          handlePlanUpdate(plan.id, { buttonText: e.target.value })
                        }
                        placeholder="Começar agora"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cor do Botão</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={plan.buttonColor}
                          onChange={(e) =>
                            handlePlanUpdate(plan.id, { buttonColor: e.target.value })
                          }
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={plan.buttonColor}
                          onChange={(e) =>
                            handlePlanUpdate(plan.id, { buttonColor: e.target.value })
                          }
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Estilo do Botão</Label>
                    <Select
                      value={plan.buttonVariant}
                      onValueChange={(value) =>
                        handlePlanUpdate(plan.id, { buttonVariant: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Padrão</SelectItem>
                        <SelectItem value="outline">Contorno</SelectItem>
                        <SelectItem value="ghost">Fantasma</SelectItem>
                        <SelectItem value="link">Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}

            <Button
              onClick={addNewPlan}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Plano
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingConfig; 