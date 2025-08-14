import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
export function useErrorHandler() {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleError = useCallback((error) => {
        console.error('Error:', error);
        let errorMessage = 'Ocorreu um erro inesperado';
        let errorCode;
        // Handle different error types
        if (error.response) {
            // API error response
            const data = error.response.data;
            errorMessage = data.message || data.error || errorMessage;
            errorCode = data.code;
            // Specific error handling
            switch (error.response.status) {
                case 400:
                    errorMessage = data.message || 'Dados inválidos. Verifique as informações fornecidas.';
                    break;
                case 401:
                    errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
                    break;
                case 403:
                    errorMessage = 'Você não tem permissão para realizar esta ação.';
                    break;
                case 404:
                    errorMessage = 'Recurso não encontrado.';
                    break;
                case 429:
                    errorMessage = 'Muitas tentativas. Por favor, aguarde um momento.';
                    break;
                case 500:
                    errorMessage = 'Erro no servidor. Por favor, tente novamente mais tarde.';
                    break;
                case 503:
                    errorMessage = 'Serviço temporariamente indisponível. Por favor, tente novamente.';
                    break;
            }
        }
        else if (error.request) {
            // Network error
            errorMessage = 'Erro de conexão. Verifique sua internet.';
        }
        else if (error.message) {
            errorMessage = error.message;
        }
        const appError = {
            message: errorMessage,
            code: errorCode,
            details: error
        };
        setError(appError);
        return appError;
    }, []);
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    const executeAsync = useCallback(async (asyncFn, options) => {
        setIsLoading(true);
        clearError();
        try {
            const result = await asyncFn();
            if ((options === null || options === void 0 ? void 0 : options.showToast) && (options === null || options === void 0 ? void 0 : options.successMessage)) {
                toast({
                    title: "Sucesso",
                    description: options.successMessage,
                });
            }
            return result;
        }
        catch (err) {
            const appError = handleError(err);
            if (options === null || options === void 0 ? void 0 : options.showToast) {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: (options === null || options === void 0 ? void 0 : options.errorMessage) || appError.message,
                });
            }
            return null;
        }
        finally {
            setIsLoading(false);
        }
    }, [handleError, clearError]);
    return {
        error,
        isLoading,
        handleError,
        clearError,
        executeAsync
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlLWVycm9yLWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1c2UtZXJyb3ItaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUM3QyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFRekMsTUFBTSxVQUFVLGVBQWU7SUFDN0IsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxRQUFRLENBQWtCLElBQUksQ0FBQyxDQUFBO0lBQ3pELE1BQU0sQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRWpELE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFO1FBQzdDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBRTlCLElBQUksWUFBWSxHQUFHLDRCQUE0QixDQUFBO1FBQy9DLElBQUksU0FBNkIsQ0FBQTtRQUVqQywrQkFBK0I7UUFDL0IsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkIscUJBQXFCO1lBQ3JCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFBO1lBQ2hDLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksWUFBWSxDQUFBO1lBQ3pELFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFBO1lBRXJCLDBCQUEwQjtZQUMxQixRQUFRLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzlCLEtBQUssR0FBRztvQkFDTixZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSx1REFBdUQsQ0FBQTtvQkFDdEYsTUFBSztnQkFDUCxLQUFLLEdBQUc7b0JBQ04sWUFBWSxH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