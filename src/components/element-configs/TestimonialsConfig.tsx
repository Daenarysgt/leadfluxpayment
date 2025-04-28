import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Star, Upload, ArrowUp, ArrowDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AdvancedColorPicker } from "./common/AdvancedColorPicker";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/lib/supabase";

interface TestimonialsConfigProps {
  element: any;
  onUpdate: (updates: any) => void;
}

const TestimonialsConfig = ({ element, onUpdate }: TestimonialsConfigProps) => {
  // Ensure there's at least one testimonial by default
  const [activeTestimonial, setActiveTestimonial] = useState(
    element.content?.testimonials?.[0]?.id || ""
  );
  const [marginTop, setMarginTop] = useState(element.content?.style?.marginTop || 0);

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

  const handleTextColorChange = (textColor: string) => {
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content?.style || {}),
          textColor
        }
      }
    });
  };

  const handleNameColorChange = (nameColor: string) => {
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content?.style || {}),
          nameColor
        }
      }
    });
  };

  const handleRoleColorChange = (roleColor: string) => {
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content?.style || {}),
          roleColor
        }
      }
    });
  };

  const handleTitleColorChange = (titleColor: string) => {
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content?.style || {}),
          titleColor
        }
      }
    });
  };

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      // Verificar se há uma imagem antiga para excluir
      const testimonial = element.content?.testimonials?.find((t: any) => t.id === id);
      if (testimonial?.avatar && testimonial.avatar.includes('supabase.co/storage')) {
        await deleteOldImage(testimonial.avatar);
      }
      
      // Redimensionar a imagem para um tamanho adequado
      const resizedFile = await resizeImage(file);
      
      // Fazer upload para o Supabase Storage
      const imageUrl = await uploadImageToStorage(resizedFile, id);
      
      // Atualizar o depoimento com a URL da imagem
      handleTestimonialChange(id, "avatar", imageUrl);
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
    }
  };
  
  // Função para redimensionar a imagem
  const resizeImage = (file: File, maxWidth = 300, maxHeight = 300): Promise<File> => {
    return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
      reader.onload = (event) => {
        const img = new Image();
        
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          // Calcular dimensões para manter proporção
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * maxHeight / height);
              height = maxHeight;
            }
          }
          
          // Criar canvas para redimensionar
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Desenhar imagem redimensionada
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Falha ao obter contexto do canvas'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Determinar tipo de saída (manter o tipo original)
          const outputType = file.type;
          
          // Converter para blob com qualidade adequada
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Falha ao redimensionar imagem'));
              return;
            }
            
            // Criar novo arquivo a partir do blob
            const resizedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now(),
            });
            
            resolve(resizedFile);
          }, outputType, outputType === 'image/jpeg' ? 0.9 : undefined);
        };
        
        img.onerror = () => {
          reject(new Error('Erro ao carregar imagem para redimensionamento'));
        };
        
        img.src = event.target?.result as string;
      };
      
      reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
    });
  };
  
  // Função para fazer upload para o Supabase Storage
  const uploadImageToStorage = async (file: File, testimonialId: string): Promise<string> => {
    try {
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${testimonialId}.${fileExt}`;
      const filePath = `testimonials/${fileName}`;
      
      // Upload do arquivo para o Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Obter a URL pública da imagem
      const { data: urlData } = supabase
        .storage
        .from('images')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      throw error;
    }
  };
  
  // Remover imagem antiga do Storage
  const deleteOldImage = async (imageUrl: string) => {
    if (!imageUrl || !imageUrl.includes('supabase.co/storage/v1/object/public/images/')) return;
    
    try {
      // Extrair o caminho da imagem da URL
      const urlParts = imageUrl.split('/public/images/');
      if (urlParts.length < 2) return;
      
      const filePath = urlParts[1];
      
      // Excluir do Storage
      const { error } = await supabase
        .storage
        .from('images')
        .remove([filePath]);
        
      if (error) console.error("Erro ao excluir imagem antiga:", error);
    } catch (error) {
      console.error("Erro ao tentar excluir imagem antiga:", error);
    }
  };

  const handleMarginTopChange = (value: number[]) => {
    // Atualizar a margem superior no estado local
    setMarginTop(value[0]);
    
    // Atualizar o elemento
    onUpdate({
      content: {
        ...element.content,
        style: {
          ...(element.content?.style || {}),
          marginTop: value[0]
        }
      }
    });
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
          borderColor: "#e5e7eb",
          titleColor: "#111827",
          textColor: "#374151",
          nameColor: "#111827",
          roleColor: "#6B7280"
        }
      }
    });
    
    setActiveTestimonial(initialTestimonial.id);
  }

  const testimonials = element.content?.testimonials || [];
  const activeTestimonialObj = testimonials.find((t: any) => t.id === activeTestimonial);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 pb-20 space-y-5">
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
                      size="sm"
                      onClick={() => handleDeleteTestimonial(activeTestimonialObj.id)}
                      className="p-0 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
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
          
          <div className="space-y-3">
            <Label htmlFor="displayStyle">Estilo de Visualização</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={element.content?.style?.displayStyle === "rectangular" || !element.content?.style?.displayStyle ? "default" : "outline"}
                size="sm"
                onClick={() => onUpdate({
                  content: {
                    ...element.content,
                    style: {
                      ...(element.content?.style || {}),
                      displayStyle: "rectangular"
                    }
                  }
                })}
                className="w-full"
              >
                Cartões
              </Button>
              <Button 
                variant={element.content?.style?.displayStyle === "horizontal" ? "default" : "outline"}
                size="sm"
                onClick={() => onUpdate({
                  content: {
                    ...element.content,
                    style: {
                      ...(element.content?.style || {}),
                      displayStyle: "horizontal"
                    }
                  }
                })}
                className="w-full"
              >
                Lista Horizontal
              </Button>
              <Button 
                variant={element.content?.style?.displayStyle === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => onUpdate({
                  content: {
                    ...element.content,
                    style: {
                      ...(element.content?.style || {}),
                      displayStyle: "grid"
                    }
                  }
                })}
                className="w-full"
              >
                Grade 2x2
              </Button>
              <Button 
                variant={element.content?.style?.displayStyle === "carousel" ? "default" : "outline"}
                size="sm"
                onClick={() => onUpdate({
                  content: {
                    ...element.content,
                    style: {
                      ...(element.content?.style || {}),
                      displayStyle: "carousel"
                    }
                  }
                })}
                className="w-full"
              >
                Carrossel
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bgColor">Cor de fundo</Label>
              <div className="mt-2">
                <AdvancedColorPicker
                  value={element.content?.style?.backgroundColor || "white"}
                  onChange={handleBackgroundColorChange}
                  size="lg"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="borderColor">Cor da borda</Label>
              <div className="mt-2">
                <AdvancedColorPicker
                  value={element.content?.style?.borderColor || "#e5e7eb"}
                  onChange={handleBorderColorChange}
                  size="lg"
                />
              </div>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Cores dos Textos</h4>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label htmlFor="titleColor">Cor do Título</Label>
                <div className="mt-2">
                  <AdvancedColorPicker
                    value={element.content?.style?.titleColor || "#111827"}
                    onChange={handleTitleColorChange}
                    size="lg"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="textColor">Cor do Depoimento</Label>
                <div className="mt-2">
                  <AdvancedColorPicker
                    value={element.content?.style?.textColor || "#374151"}
                    onChange={handleTextColorChange}
                    size="lg"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="nameColor">Cor do Nome</Label>
                <div className="mt-2">
                  <AdvancedColorPicker
                    value={element.content?.style?.nameColor || "#111827"}
                    onChange={handleNameColorChange}
                    size="lg"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="roleColor">Cor do Cargo/Empresa</Label>
                <div className="mt-2">
                  <AdvancedColorPicker
                    value={element.content?.style?.roleColor || "#6B7280"}
                    onChange={handleRoleColorChange}
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Controle de Margem Superior */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="margin-top">Margem superior</Label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">{marginTop}px</span>
                <div className="flex flex-col">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5"
                    onClick={() => handleMarginTopChange([marginTop - 5])}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5"
                    onClick={() => handleMarginTopChange([marginTop + 5])}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Slider
              id="margin-top"
              min={-100}
              max={100}
              step={1}
              value={[marginTop]}
              onValueChange={handleMarginTopChange}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default TestimonialsConfig;
