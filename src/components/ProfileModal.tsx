import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { X, CreditCard, CheckCircle, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  planInfo?: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

export function ProfileModal({ open, onOpenChange, user, planInfo }: ProfileModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Obter iniciais para o avatar como fallback
  const getUserInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  // Função para determinar o nome de exibição do plano
  const getPlanDisplayName = (planId: string) => {
    if (planId === 'free') return 'Gratuito';
    if (planId === 'pro') return 'Profissional';
    if (planId === 'business') return 'Empresarial';
    return planId.charAt(0).toUpperCase() + planId.slice(1);
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    try {
      setIsUpdating(true);
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) throw error;

      toast.success("Sua senha foi atualizada com sucesso.");

      // Limpar os campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro ao atualizar a senha.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl border-blue-100 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
        <DialogHeader className="pb-2 border-b border-blue-100/40">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Perfil do Usuário</DialogTitle>
            <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-blue-100/40 transition-colors">
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </DialogClose>
          </div>
          <DialogDescription className="text-muted-foreground">
            Visualize informações da sua conta e altere sua senha.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Informações do usuário */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-blue-200 bg-gradient-to-br from-blue-100 to-purple-100 shadow-sm">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                <AvatarFallback className="text-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  {getUserInitials(user.email || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-lg">{user.email}</h4>
                <p className="text-sm text-muted-foreground">
                  Conta criada em {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Informações do plano */}
          {planInfo && (
            <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-sm">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Plano Atual
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{getPlanDisplayName(planInfo.id)}</span>
                  {planInfo.isActive && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-2 rounded-full text-xs font-medium">
                      <CheckCircle className="h-3 w-3 mr-1" /> Ativo
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" className="rounded-full text-sm hover:bg-blue-50 border-blue-100 shadow-sm hover:shadow transition-all">
                  Alterar Plano
                </Button>
              </div>
            </div>
          )}

          {/* Alteração de senha */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-blue-600" />
              Alterar Senha
            </h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="border-blue-100 focus-visible:ring-blue-400/30 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border-blue-100 focus-visible:ring-blue-400/30 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-blue-100 focus-visible:ring-blue-400/30 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-blue-100/40 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="rounded-full hover:bg-slate-50 border-slate-200"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdatePassword} 
            disabled={isUpdating || !currentPassword || !newPassword || !confirmPassword}
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 shadow-sm"
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Atualizando...</span>
              </div>
            ) : (
              "Atualizar Senha"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileModal; 