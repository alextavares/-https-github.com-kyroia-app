## Worker de Webhooks (MercadoPago)

Passos para habilitar o processamento assíncrono confiável:

1. Variáveis de ambiente
   - `MERCADOPAGO_WEBHOOK_SECRET` (já usada na rota de webhook)
   - `WEBHOOK_WORKER_TOKEN`: crie um token aleatório forte
   - `APP_URL`: URL pública da aplicação, ex: `https://app.seudominio.com`

2. Endpoint
   - `POST /api/mercadopago/webhook/process-pending`
   - Envie o header `x-worker-token: ${WEBHOOK_WORKER_TOKEN}`

3. Worker (DigitalOcean)
   - O arquivo `app.yaml` define um serviço `webhook-worker` que roda `node scripts/cron/webhook-worker.js`
   - Esse script chama o endpoint a cada 60s

4. Teste local (opcional)
   - `WEBHOOK_WORKER_TOKEN=dev APP_URL=http://localhost:3000 node scripts/cron/webhook-worker.js`

5. Observabilidade
   - Logs no serviço `webhook-worker` mostrarão o resultado de cada execução
   - A tabela `MercadoPagoWebhookLog` registra `PENDING|PROCESSED|FAILED`


