# 🔧 Correção Google OAuth - Porta 3025

## ❌ Erro Atual:
```
Erro 400: redirect_uri_mismatch
```

## ✅ Solução:

### 1. Acesse Google Cloud Console
https://console.cloud.google.com/

### 2. Navegue para Credentials
"APIs & Services" > "Credentials"

### 3. Edite o OAuth 2.0 Client ID
Clique em: `968852529196-eq0ncthod583ctlc0nb4rc3roe8jk1tm`

### 4. Configure os URIs Corretos

**Authorized JavaScript origins:**
```
http://localhost:3025
```

**Authorized redirect URIs:**
```
http://localhost:3025/api/auth/callback/google
```

### 5. Remova URIs da Porta 3000 (se existirem)
- ❌ `http://localhost:3000`
- ❌ `http://localhost:3000/api/auth/callback/google`

### 6. Salve as Alterações
Clique em "Save" no Google Cloud Console

### 7. Teste o Login
- Aguarde 1-2 minutos para propagação
- Acesse: http://localhost:3025/auth/signin
- Clique em "Continuar com Google"

## 🔍 Verificação:
O redirect URI deve ser exatamente:
`http://localhost:3025/api/auth/callback/google`