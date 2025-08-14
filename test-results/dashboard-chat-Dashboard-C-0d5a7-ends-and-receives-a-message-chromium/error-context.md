# Page snapshot

```yaml
- text: IA Entrar no InnerAI Faça login usando sua conta Google/Apple ou email e senha Login social não configurado. Use login por email. ou Falha ao entrar. Tente novamente.
- textbox "Seu email": alexandretmoraes1@gmail.com
- textbox "Sua senha": Y*mare2025
- button "Entrar com email"
- text: Não tem uma conta?
- link "Criar conta":
  - /url: /auth/signup
- region "Notifications (F8)":
  - list
- alert
```