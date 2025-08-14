export const ErrorMessages = {
    // Authentication errors
    AUTH: {
        INVALID_CREDENTIALS: 'Email ou senha incorretos',
        EMAIL_ALREADY_EXISTS: 'Este email já está cadastrado',
        WEAK_PASSWORD: 'A senha deve ter pelo menos 6 caracteres',
        SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente',
        UNAUTHORIZED: 'Você precisa estar logado para acessar esta página',
    },
    // Payment errors
    PAYMENT: {
        INVALID_PLAN: 'Plano selecionado inválido',
        PAYMENT_FAILED: 'O pagamento não pôde ser processado. Verifique seus dados',
        SUBSCRIPTION_EXISTS: 'Você já possui uma assinatura ativa',
        WEBHOOK_FAILED: 'Erro ao processar webhook de pagamento',
        CARD_DECLINED: 'Cartão recusado. Verifique os dados ou tente outro cartão',
    },
    // Chat/AI errors
    CHAT: {
        MESSAGE_LIMIT_REACHED: 'Você atingiu o limite de mensagens do seu plano',
        TOKEN_LIMIT_REACHED: 'Você atingiu o limite de tokens do seu plano',
        AI_SERVICE_ERROR: 'Erro ao processar sua mensagem. Tente novamente',
        MODEL_NOT_AVAILABLE: 'Este modelo não está disponível para seu plano',
    },
    // Database errors
    DATABASE: {
        CONNECTION_ERROR: 'Erro de conexão com o banco de dados',
        QUERY_FAILED: 'Erro ao executar operação no banco de dados',
        RECORD_NOT_FOUND: 'Registro não encontrado',
    },
    // Network errors
    NETWORK: {
        NO_INTERNET: 'Sem conexão com a internet',
        TIMEOUT: 'A requisição demorou muito para responder',
        SERVER_ERROR: 'Erro no servidor. Por favor, tente novamente',
    },
    // Validation errors
    VALIDATION: {
        REQUIRED_FIELDS: 'Por favor, preencha todos os campos obrigatórios',
        INVALID_EMAIL: 'Email inválido',
        PASSWORDS_DONT_MATCH: 'As senhas não coincidem',
        INVALID_PHONE: 'Número de telefone inválido',
    },
    // Generic errors
    GENERIC: {
        UNKNOWN_ERROR: 'Ocorreu um erro inesperado. Por favor, tente novamente',
        TRY_AGAIN: 'Por favor, tente novamente',
        CONTACT_SUPPORT: 'Se o problema persistir, entre em contato com o suporte',
    }
};
// Helper function to get user-friendly error message
export function getUserFriendlyError(error) {
    // Check for specific error codes or messages
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return ErrorMessages.AUTH.EMAIL_ALREADY_EXISTS;
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return ErrorMessages.DATABASE.RECORD_NOT_FOUND;
    }
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        if (error.message.includes('connect')) {
            return ErrorMessages.DATABASE.CONNECTION_ERROR;
        }
        if (error.message.includes('timeout')) {
            return ErrorMessages.NETWORK.TIMEOUT;
        }
        if (error.message.includes('Network')) {
            return ErrorMessages.NETWORK.NO_INTERNET;
        }
        return error.message;
    }
    // Default to generic error
    return ErrorMessages.GENERIC.UNKNOWN_ERROR;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3ItbWVzc2FnZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJlcnJvci1tZXNzYWdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUc7SUFDM0Isd0JBQXdCO0lBQ3hCLElBQUksRUFBRTtRQUNKLG1CQUFtQixFQUFFLDJCQUEyQjtRQUNoRCxvQkFBb0IsRUFBRSwrQkFBK0I7UUFDckQsYUFBYSxFQUFFLDBDQUEwQztRQUN6RCxlQUFlLEVBQUUscURBQXFEO1FBQ3RFLFlBQVksRUFBRSxvREFBb0Q7S0FDbkU7SUFFRCxpQkFBaUI7SUFDakIsT0FBTyxFQUFFO1FBQ1AsWUFBWSxFQUFFLDRCQUE0QjtRQUMxQyxjQUFjLEVBQUUsMkRBQTJEO1FBQzNFLG1CQUFtQixFQUFFLHFDQUFxQztRQUMxRCxjQUFjLEVBQUUsd0NBQXdDO1FBQ3hELGFBQWEsRUFBRSwyREFBMkQ7S0FDM0U7SUFFRCxpQkFBaUI7SUFDakIsSUFBSSxFQUFFO1FBQ0oscUJBQXFCLEVBQUUsaURBQWlEO1FBQ3hFLG1CQUFtQixFQUFFLDhDQUE4QztRQUNuRSxnQkFBZ0IsRUFBRSxpREFBaUQ7UUFDbkUsbUJBQW1CLEVBQUUsZ0RBQWdEO0tBQ3RFO0lBRUQsa0JBQWtCO0lBQ2xCLFFBQVEsRUFBRTtRQUNSLGdCQUFnQixFQUFFLHNDQUFzQztRQUN4RCxZQUFZLEVBQUUsNkNBQTZDO1FBQzNELGdCQUFnQixFQUFFLHlCQUF5QjtLQUM1QztJQUVELGlCQUFpQjtJQUNqQixPQUFPLEVBQUU7UUFDUCxXQUFXLEVBQUUsNEJBQTRCO1FBQ3pDLE9BQU8sRUFBRSwyQ0FBMkM7UUFDcEQsWUFBWSxFQUFFLDhDQUE4QztLQUM3RDtJQUVELG9CQUFvQjtJQUNwQixVQUFVLEVBQUU7UUFDVixlQUFlLEVBQUUsa0RBQWtEO1FBQ25FLGFBQWEsRUFBRSxnQkFBZ0I7UUFDL0Isb0JBQW9CLEVBQUUseUJBQXlCO1FBQy9DLGFBQWEsRUFBRSw2QkFBNkI7S0FDN0M7SUFFRCxpQkFBaUI7SUFDakIsT0FBTyxFQUFFO1FBQ1AsYUFBYSxFQUFFLHdEQUF3RDtRQUN2RSxTQUFTLEVBQUUsNEJBQTRCO1FBQ3ZDLGVBQWUsRUFBRSx5REFBeUQ7S0FDM0U7Q0FDRixDQUFBO0FBRUQscURBQXFEO0FBQ3JELE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxLQUFjO0lBQ2pELDZDQUE2QztJQUM3QyxJQUFJLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksTUFBTSxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO1FBQ3BGLE9BQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQTtJQUNoRCxDQUFDO0lBRUQsSUFBSSxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLE1BQU0sSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUUsQ0FBQztRQUNwRixPQUFPLGFBQWEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUE7SUFDaEQsQ0FBQztJQUVELElBQUksS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxTQUFTLElBQUksS0FBSyxJQUFJLE9BQU8sS0FBSyxDQUFDLE9BQU8sS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUNsRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDdEMsT0FBTyxhQUFhLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFBO1FBQ2hELENBQUM7UUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDdEMsT0FBTyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQTtRQUN0QyxDQUFDO1FBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQ3RDLE9BQU8sYUFBYSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUE7UUFDMUMsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQTtJQUN0QixDQUFDO0lBRUQsMkJBQTJCO0lBQzNCLE9BQU8sYUFBYSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUE7QUFDNUMsQ0FBQyJ9