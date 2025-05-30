import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { domainsService } from '@/services/domains';
import { Domain, DomainStatus } from '@/types/domain';
import { AlertCircle, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DomainManager({ funnelId }: { funnelId: string }) {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [newDomain, setNewDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState<string>('');
    const { toast } = useToast();

    // Carregar domínios
    useEffect(() => {
        loadDomains();
    }, []);

    async function loadDomains() {
        try {
            const data = await domainsService.listDomains(funnelId);
            setDomains(data);
        } catch (error) {
            toast({
                title: "Erro ao carregar domínios",
                description: "Não foi possível carregar seus domínios.",
                variant: "destructive"
            });
        }
    }

    // Adicionar domínio
    async function handleAddDomain(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await domainsService.addDomain({
                domain: newDomain,
                funnel_id: funnelId
            });

            setNewDomain('');
            await loadDomains();
            
            toast({
                title: "Domínio adicionado",
                description: "Configure os registros DNS para ativar seu domínio.",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao adicionar domínio",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

    // Remover domínio
    async function handleRemoveDomain(id: string) {
        try {
            await domainsService.removeDomain(id);
            await loadDomains();
            
            toast({
                title: "Domínio removido",
                description: "O domínio foi removido com sucesso.",
            });
        } catch (error) {
            toast({
                title: "Erro ao remover domínio",
                description: "Não foi possível remover o domínio.",
                variant: "destructive"
            });
        }
    }

    // Adicionar função para verificar domínio
    const handleVerifyDomain = async (domain: Domain) => {
        try {
            setIsVerifying(domain.id);
            const status = await domainsService.checkDomainStatus(domain.domain);
            
            // Atualizar o status do domínio na lista
            setDomains(domains.map(d => 
                d.id === domain.id ? { ...d, status: status as DomainStatus } : d
            ));

            toast({
                title: status === 'active' ? 'Domínio ativo!' : 'Domínio ainda pendente',
                description: status === 'active' 
                    ? 'Seu domínio está configurado corretamente.'
                    : 'Aguarde a propagação do DNS ou verifique as configurações.',
                variant: status === 'active' ? 'default' : 'destructive',
            });
        } catch (error) {
            console.error('Erro ao verificar domínio:', error);
            toast({
                title: 'Erro ao verificar domínio',
                description: 'Não foi possível verificar o status do domínio.',
                variant: 'destructive',
            });
        } finally {
            setIsVerifying('');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Domínios Personalizados</CardTitle>
                <CardDescription>
                    Conecte seu próprio domínio ao seu funil de vendas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {domains.length === 0 ? (
                    // Formulário para adicionar domínio (mostrado apenas se não houver domínios)
                    <form onSubmit={handleAddDomain} className="flex gap-2 mb-4">
                        <Input
                            placeholder="exemplo.com.br"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            disabled={loading}
                        />
                        <Button type="submit" disabled={loading}>
                            Adicionar
                        </Button>
                    </form>
                ) : (
                    // Mensagem informativa quando já existe um domínio
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-900">Um domínio já está conectado</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    Para adicionar um novo domínio, primeiro remova o domínio existente.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de domínios */}
                <div className="space-y-3">
                    {domains.map((domain) => (
                        <div
                            key={domain.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                            <div className="flex items-center gap-3">
                                {domain.status === 'active' ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                                )}
                                <div>
                                    <p className="font-medium">{domain.domain}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {domain.status === 'active' ? 'Ativo' : 'Pendente'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {domain.status === 'pending' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-8 h-8 p-0"
                                        onClick={() => handleVerifyDomain(domain)}
                                        disabled={isVerifying === domain.id}
                                    >
                                        <RefreshCw className={cn(
                                            "h-4 w-4",
                                            isVerifying === domain.id && "animate-spin"
                                        )} />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => handleRemoveDomain(domain.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Instruções DNS */}
                {domains.length > 0 && domains.some(d => d.status === 'pending') && (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium mb-2">Configuração DNS</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Configure os seguintes registros no seu provedor de domínio:
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-3 gap-4 p-2 bg-white rounded">
                                <span>Tipo: A</span>
                                <span>Nome: @</span>
                                <span>Valor: 76.76.21.21</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 p-2 bg-white rounded">
                                <span>Tipo: CNAME</span>
                                <span>Nome: www</span>
                                <span>Valor: cname.vercel-dns.com</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 