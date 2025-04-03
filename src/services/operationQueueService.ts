/**
 * Tipo para operações que podem ser enfileiradas
 */
type QueuedOperation<T> = {
  operation: (data: T) => Promise<any>;
  data: T;
  attempts: number;
  maxAttempts: number;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  description: string;
};

/**
 * Serviço para gerenciar fila de operações com retry automático
 */
class OperationQueueService {
  private queue: QueuedOperation<any>[] = [];
  private isProcessing: boolean = false;
  private maxRetries: number = 3;
  private pendingOperations: number = 0;
  
  /**
   * Adiciona uma operação à fila
   */
  enqueue<T>(
    operation: (data: T) => Promise<any>, 
    data: T, 
    options: {
      maxAttempts?: number;
      onSuccess?: (result: any) => void;
      onError?: (error: any) => void;
      description?: string;
    } = {}
  ): void {
    const {
      maxAttempts = this.maxRetries,
      onSuccess,
      onError,
      description = 'Operação não especificada'
    } = options;
    
    this.queue.push({
      operation,
      data,
      attempts: 0,
      maxAttempts,
      onSuccess,
      onError,
      description
    });
    
    this.pendingOperations++;
    
    console.log(`OperationQueue - Operação enfileirada: ${description}`);
    
    // Iniciar processamento se não estiver em andamento
    if (!this.isProcessing) {
      this.processQueue();
    }
  }
  
  /**
   * Processa a fila de operações
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    let operation = null;
    
    try {
      operation = this.queue.shift();
      
      if (!operation) {
        this.isProcessing = false;
        return;
      }
      
      console.log(`OperationQueue - Processando: ${operation.description} (tentativa ${operation.attempts + 1}/${operation.maxAttempts})`);
      
      const result = await operation.operation(operation.data);
      
      console.log(`OperationQueue - Sucesso: ${operation.description}`);
      
      if (operation.onSuccess) {
        operation.onSuccess(result);
      }
      
      this.pendingOperations--;
      
    } catch (error) {
      console.error(`OperationQueue - Erro:`, error);
      
      if (operation) {
        console.error(`OperationQueue - Erro: ${operation.description}`, error);
        
        if (operation.attempts < operation.maxAttempts - 1) {
          // Tentar novamente com backoff exponencial
          const nextAttempt = {
            ...operation,
            attempts: operation.attempts + 1
          };
          
          const delay = Math.pow(2, nextAttempt.attempts) * 1000; // 2^n segundos
          
          console.log(`OperationQueue - Agendando nova tentativa em ${delay}ms`);
          
          setTimeout(() => {
            this.queue.unshift(nextAttempt);
            
            // Se não estiver processando, retomar processamento
            if (!this.isProcessing) {
              this.processQueue();
            }
          }, delay);
        } else {
          // Falha definitiva após todas as tentativas
          console.error(`OperationQueue - Falha definitiva após ${operation.attempts + 1} tentativas: ${operation.description}`);
          
          if (operation.onError) {
            operation.onError(error);
          }
          
          this.pendingOperations--;
        }
      } else {
        // Erro sem operação definida
        console.error(`OperationQueue - Erro crítico no processamento da fila:`, error);
        this.pendingOperations--;
      }
    } finally {
      this.isProcessing = false;
      
      // Processar próxima operação se houver
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }
  
  /**
   * Retorna o número de operações pendentes
   */
  get hasPendingOperations(): boolean {
    return this.pendingOperations > 0;
  }
  
  /**
   * Retorna o número de operações pendentes
   */
  get pendingOperationsCount(): number {
    return this.pendingOperations;
  }
}

// Instância única para uso em toda a aplicação
export const operationQueueService = new OperationQueueService(); 