# Guia de Testes Manuais - Sistema de Controle de Gastos da IA

## 📋 Visão Geral
Este guia detalha como testar manualmente o sistema de controle de gastos da IA implementado no InnerAI Clone.

## 🔍 Sistema Implementado

### Componentes Analisados:
- ✅ **CreditService**: Gerenciamento completo de créditos
- ✅ **Usage Limits**: Controle por planos (FREE, LITE, PRO, ENTERPRISE)
- ✅ **Chat API**: Integração com verificação de créditos
- ✅ **Credit Balance API**: Consulta de saldo
- ✅ **Database Schema**: Tabelas `users.creditBalance` e `CreditTransaction`

## 🧪 Testes Manuais

### Teste 1: Verificar Saldo de Créditos
**Objetivo**: Verificar se o sistema mostra o saldo corretamente

1. **Acesse**: http://localhost:3025/dashboard
2. **Verificar**: 
   - Saldo de créditos é exibido
   - API `/api/credits/balance` retorna resposta correta
3. **Esperado**: Saldo atual do usuário logado

### Teste 2: Consumo de Créditos no Chat
**Objetivo**: Verificar se créditos são consumidos ao usar modelos pagos

1. **Acesse**: Chat no dashboard
2. **Selecione**: Modelo que requer créditos (ex: gpt-4o, claude-3.5-sonnet)
3. **Envie**: Uma mensagem de teste
4. **Verificar**:
   - Resposta da IA é gerada
   - Saldo de créditos diminui
   - Transação é registrada no banco

### Teste 3: Limite de Créditos Insuficientes
**Objetivo**: Verificar comportamento quando créditos são insuficientes

1. **Cenário**: Configure usuário com poucos créditos
2. **Teste**: Envie mensagem com modelo caro
3. **Esperado**: 
   - Erro 402 "Payment Required"
   - Mensagem indicando créditos insuficientes
   - Saldo não alterado

### Teste 4: Modelos Gratuitos vs Pagos
**Objetivo**: Verificar diferenciação entre modelos

1. **Teste A**: Use modelo gratuito (ex: gpt-4o-mini)
   - **Esperado**: Funciona sem consumir créditos
2. **Teste B**: Use modelo pago (ex: gpt-4o)
   - **Esperado**: Consome créditos conforme configuração

### Teste 5: Limites por Plano
**Objetivo**: Verificar restrições por tipo de plano

1. **FREE Plan**:
   - Máximo 50 mensagens/dia
   - 0 mensagens avançadas/mês
   - Apenas modelos básicos
2. **LITE Plan**:
   - Mensagens ilimitadas (modelos rápidos)
   - 120 mensagens avançadas/mês
3. **PRO/ENTERPRISE**:
   - Sem limites de mensagens
   - Todos os modelos disponíveis

## 🗄️ Verificações no Banco de Dados

### Consultas Úteis:
```sql
-- Verificar saldo do usuário
SELECT id, email, creditBalance, planType FROM User;

-- Verificar transações de crédito
SELECT * FROM CreditTransaction ORDER BY createdAt DESC LIMIT 10;

-- Verificar uso por modelo
SELECT * FROM UserUsage ORDER BY date DESC LIMIT 10;

-- Verificar conversas e mensagens
SELECT c.id, c.title, c.modelUsed, m.tokensUsed 
FROM Conversation c 
JOIN Message m ON c.id = m.conversationId 
ORDER BY c.createdAt DESC;
```

## 📊 Dados de Teste

### Configurações de Créditos por Modelo:
```javascript
// Modelos gratuitos (0 créditos)
'gpt-4o-mini', 'claude-3.5-haiku', 'gemini-2-flash-free'

// Modelos de custo médio (1-5 créditos por 1k tokens)
'gpt-3.5-turbo', 'claude-3.5-sonnet'

// Modelos premium (5-10 créditos por 1k tokens)
'gpt-4o', 'claude-4-sonnet'
```

### Planos e Limites:
- **FREE**: 50 msg/dia, 0 avançadas/mês
- **LITE**: Ilimitado rápido, 120 avançadas/mês
- **PRO**: Ilimitado tudo, 1M créditos/mês
- **ENTERPRISE**: Ilimitado tudo

## ✅ Checklist de Validação

### Frontend:
- [ ] Saldo de créditos visível no dashboard
- [ ] Avisos de créditos baixos
- [ ] Mensagens de erro claras
- [ ] Indicação de modelo gratuito/pago

### Backend:
- [ ] API `/api/credits/balance` funcional
- [ ] Verificação prévia de créditos no chat
- [ ] Consumo pós-processamento
- [ ] Transações registradas corretamente

### Banco de Dados:
- [ ] Campo `creditBalance` atualizado
- [ ] Tabela `CreditTransaction` com histórico
- [ ] Tabela `UserUsage` com estatísticas
- [ ] Relacionamentos íntegros

## 🚨 Cenários de Erro

### Casos Especiais:
1. **Usuário sem créditos**: Deve ver mensagem clara
2. **Modelo não disponível**: Erro 403 com explicação
3. **Falha na IA**: Créditos não consumidos
4. **Transação falhada**: Rollback automático

## 📈 Métricas de Sucesso

### KPIs para Monitorar:
- Taxa de sucesso de transações de crédito
- Tempo de resposta das APIs
- Precisão dos cálculos de consumo
- Integridade dos dados de uso

---

**Status**: ✅ Sistema completamente implementado e testável
**Última Atualização**: Janeiro 2025