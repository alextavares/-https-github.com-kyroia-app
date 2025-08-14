# Configuração Google OAuth para InnerAI Clone

## 1. Google Cloud Console Setup

### Criar/Selecionar Projeto
1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione existente
3. Anote o Project ID

### Ativar APIs Necessárias
1. Vá em "APIs & Services" > "Library"
2. Ative as seguintes APIs:
   - Google+ API
   - Google OAuth2 API

### Configurar OAuth Consent Screen
1. "APIs & Services" > "OAuth consent screen"
2. Tipo: "External" (para desenvolvimento)
3. Informações da aplicação:
   - **App name**: InnerAI Clone
   - **User support email**: [seu-email]
   - **Developer contact**: [seu-email]

4. Escopos obrigatórios:
   - `email`
   - `profile` 
   - `openid`

### Criar OAuth 2.0 Client
1. "APIs & Services" > "Credentials"
2. "Create Credentials" > "OAuth client ID"
3. Tipo: "Web application"
4. Configurações:
   - **Name**: InnerAI Clone Local
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/google
     ```

## 2. Configuração Local

### Atualizar .env
Após criar o OAuth client, copie as credenciais:

```env
# Google OAuth
GOOGLE_CLIENT_ID="seu-client-id-aqui.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-client-secret-aqui"
```

### Verificar Configuração
1. Reinicie o servidor Next.js
2. Acesse: http://localhost:3000/auth/signin
3. O botão "Continuar com Google" deve funcionar

## 3. Solução de Problemas

### Erro: "redirect_uri_mismatch"
- Verifique se o redirect URI está exatamente: `http://localhost:3000/api/auth/callback/google`
- Sem trailing slash ou parâmetros extras

### Erro: "access_blocked"
- Adicione seu email como usuário de teste em "OAuth consent screen" > "Test users"

### Erro: "invalid_client"
- Verifique se CLIENT_ID e CLIENT_SECRET estão corretos
- Confirme se as variáveis de ambiente foram salvas

## 4. Configuração para Produção

Para produção no Digital Ocean:
```env
NEXTAUTH_URL="https://seu-dominio.com"
```

E adicione nos redirect URIs:
```
https://seu-dominio.com/api/auth/callback/google
```