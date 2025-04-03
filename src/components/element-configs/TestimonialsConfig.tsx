
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Star, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TestimonialsConfigProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const TestimonialsConfig = ({ element, onUpdate }: TestimonialsConfigProps) => {
  // Ensure there's at least one testimonial by default
  const [activeTestimonial, setActiveTestimonial] = useState(
    element.content?.testimonials?.[0]?.id || ""
  );

  const handleTitleChange = (title: string) => {
    onUpdate({
      content: {
        ...element.content,
        title
      }
    });
  };

  const handleTitleAlignmentChange = (alignment: "left" | "center") => {
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content?.style || {}),
          titleAlignment: alignment
        }
      }
    });
  };

  const handleTestimonialChange = (id: string, field: string, value: any) => {
    const updatedTestimonials = element.content?.testimonials?.map((t: any) => 
      t.id === id ? { ...t, [field]: value } : t
    ) || [];
    
    onUpdate({
      content: {
        ...element.content,
        testimonials: updatedTestimonials
      }
    });
  };

  const handleAddTestimonial = () => {
    const newTestimonial = {
      id: crypto.randomUUID(),
      name: "Nome do cliente",
      role: "Cargo / Empresa",
      text: "Este produto/serviço transformou minha vida. Eu recomendo para todos!",
      rating: 5
    };
    
    const updatedTestimonials = [
      ...(element.content?.testimonials || []),
      newTestimonial
    ];
    
    onUpdate({
      content: {
        ...element.content,
        testimonials: updatedTestimonials
      }
    });

    setActiveTestimonial(newTestimonial.id);
  };

  const handleDeleteTestimonial = (id: string) => {
    const updatedTestimonials = element.content?.testimonials?.filter(
      (t: any) => t.id !== id
    );
    
    onUpdate({
      content: {
        ...element.content,
        testimonials: updatedTestimonials
      }
    });

    if (activeTestimonial === id && updatedTestimonials.length > 0) {
      setActiveTestimonial(updatedTestimonials[0].id);
    }
  };

  const handleBackgroundColorChange = (backgroundColor: string) => {
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content?.style || {}),
          backgroundColor
        }
      }
    });
  };

  const handleBorderColorChange = (borderColor: string) => {
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content?.style || {}),
          borderColor
        }
      }
    });
  };

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      handleTestimonialChange(id, "avatar", reader.result as string);
    };
    
    reader.readAsDataURL(file);
  };

  // Initialize testimonials array if it doesn't exist
  if (!element.content?.testimonials || element.content.testimonials.length === 0) {
    const initialTestimonial = {
      id: crypto.randomUUID(),
      name: "Nome do cliente",
      role: "Cargo / Empresa",
      text: "Este produto/serviço transformou minha vida. Eu recomendo para todos!",
      rating: 5
    };
    
    onUpdate({
      content: {
        ...element.content,
        testimonials: [initialTestimonial],
        style: {
          ...(element.content?.style || {}),
          displayStyle: "rectangular",
          titleAlignment: "center",
          backgroundColor: "white",
          borderColor: "#e5e7eb"
        }
      }
    });
    
    setActiveTestimonial(initialTestimonial.id);
  }

  const testimonials = element.content?.testimonials || [];
  const activeTestimonialObj = testimonials.find((t: any) => t.id === activeTestimonial);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={element.content?.title || ""}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Depoimentos dos nossos clientes"
          />
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button 
              variant={element.content?.style?.titleAlignment === "left" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTitleAlignmentChange("left")}
              className="w-full"
            >
              Esquerda
            </Button>
            <Button 
              variant={element.content?.style?.titleAlignment === "center" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTitleAlignmentChange("center")}
              className="w-full"
            >
              Centro
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Depoimentos</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTestimonial}
            >
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>
          
          {testimonials.length > 0 && (
            <div className="space-y-4">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {testimonials.map((testimonial: any, index: number) => (
                  <div
                    key={testimonial.id}
                    className={`flex-shrink-0 cursor-pointer ${
                      activeTestimonial === testimonial.id
                        ? "ring-2 ring-primary rounded-full"
                        : ""
                    }`}
                    onClick={() => setActiveTestimonial(testimonial.id)}
                  >
                    <Avatar className="h-10 w-10">
                      {testimonial.avatar ? (
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name || `Cliente ${index + 1}`} />
                      ) : (
                        <AvatarFallback className="bg-gray-200">
                          {(testimonial.name?.charAt(0) || index + 1)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                ))}
              </div>
              
              {activeTestimonialObj && (
                <div className="space-y-3 border rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 w-full">
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={activeTestimonialObj.name || ""}
                          onChange={(e) =>
                            handleTestimonialChange(
                              activeTestimonialObj.id,
                              "name",
                              e.target.value
                            )
                          }
                          className="mt-1"
                          placeholder="Nome do cliente"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="role">Cargo / Empresa</Label>
                        <Input
                          id="role"
                          value={activeTestimonialObj.role || ""}
                          onChange={(e) =>
                            handleTestimonialChange(
                              activeTestimonialObj.id,
                              "role",
                              e.target.value
                            )
                          }
                          className="mt-1"
                          placeholder="CEO / Empresa ABC"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="rating">Avaliação</Label>
                        <div className="flex space-x-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="focus:outline-none"
                              onClick={() =>
                                handleTestimonialChange(
                                  activeTestimonialObj.id,
                                  "rating",
                                  star
                                )
                              }
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= (activeTestimonialObj.rating || 0)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Foto do Cliente</Label>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            {activeTestimonialObj.avatar ? (
                              <AvatarImage src={activeTestimonialObj.avatar} alt={activeTestimonialObj.name || ""} />
                            ) : (
                              <AvatarFallback className="bg-gray-200">
                                {activeTestimonialObj.name?.charAt(0).toUpperCase() || "?"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          
                          <div className="flex-1">
                            <label className="cursor-pointer">
                              <div className="flex items-center gap-2 border rounded-md p-2 hover:bg-gray-50 transition-colors">
                                <Upload className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">Fazer upload</span>
                              </div>
                              <input 
                                type="file" 
                                accept="image/*"
                                className="hidden" 
                                onChange={(e) => handleImageUpload(activeTestimonialObj.id, e)}
                              />
                            </label>
                          </div>
                          
                          {activeTestimonialObj.avatar && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTestimonialChange(
                                activeTestimonialObj.id,
                                "avatar",
                                null
                              )}
                            >
                              Remover
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="text">Depoimento</Label>
                        <Textarea
                          id="text"
                          value={activeTestimonialObj.text || ""}
                          onChange={(e) =>
                            handleTestimonialChange(
                              activeTestimonialObj.id,
                              "text",
                              e.target.value
                            )
                          }
                          className="mt-1"
                          placeholder="Digite o depoimento aqui..."
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTestimonial(activeTestimonialObj.id)}
                      disabled={testimonials.length <= 1}
                      className="h-8 w-8 ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <h3 className="font-medium">Aparência</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bgColor">Cor de fundo</Label>
              <div className="flex mt-1">
                <div 
                  className="h-8 w-8 rounded border mr-2"
                  style={{ backgroundColor: element.content?.style?.backgroundColor || 'white' }}
                />
                <Input
                  id="bgColor"
                  value={element.content?.style?.backgroundColor || "white"}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="borderColor">Cor da borda</Label>
              <div className="flex mt-1">
                <div 
                  className="h-8 w-8 rounded border mr-2"
                  style={{ backgroundColor: element.content?.style?.borderColor || '#e5e7eb' }}
                />
                <Input
                  id="borderColor"
                  value={element.content?.style?.borderColor || "#e5e7eb"}
                  onChange={(e) => handleBorderColorChange(e.target.value)}
                  placeholder="#e5e7eb"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default TestimonialsConfig;
