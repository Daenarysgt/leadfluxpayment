import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Funnel } from "@/utils/types";
import { accessService } from "@/services/accessService";
import { Lock } from "lucide-react";

interface FunnelPasswordProtectionProps {
  funnel: Funnel;
  onPasswordVerified: () => void;
}

const FunnelPasswordProtection = ({ funnel, onPasswordVerified }: FunnelPasswordProtectionProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const isCorrect = await accessService.verifyPassword(funnel.id, password);
      
      if (isCorrect) {
        onPasswordVerified();
      } else {
        setError("Senha incorreta. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao verificar senha:", err);
      setError("Ocorreu um erro ao verificar a senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Lock className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold mt-4">{funnel.name}</h1>
          <p className="text-muted-foreground mt-2">
            Este funil está protegido por senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Digite a senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
            disabled={isLoading}
          />
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Verificando..." : "Acessar Funil"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default FunnelPasswordProtection; 