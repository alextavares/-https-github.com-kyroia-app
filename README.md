# InnerAI Clone

Um clone avançado do InnerAI com suporte a múltiplos modelos de IA, pagamentos via MercadoPago e funcionalidades completas de chat.

## Documentação

- [Configuração do MercadoPago](./MERCADOPAGO_SETUP.md) - Guia completo para configurar pagamentos reais
- [Deploy no Digital Ocean](./DIGITAL_OCEAN_SETUP.md) - Instruções para deploy em produção
- [Guia de Testes](./TESTING_GUIDE.md) - Como executar os testes automatizados
- Documentação técnica consolidada: [docs/index.md](./docs/index.md)
- Dependências por pastas: [docs/dependencies-overview.md](./docs/dependencies-overview.md)
- Endpoints da API por domínio: [docs/api-endpoints.md](./docs/api-endpoints.md)

## Diagramas (visualização rápida)

![Dependências](./docs/images/dependencies-overview.svg)

Se preferir PNG: [dependencies-overview.png](./docs/images/dependencies-overview.png)

![API Endpoints](./docs/images/api-endpoints.svg)

Se preferir PNG: [api-endpoints.png](./docs/images/api-endpoints.png)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Captura e Animação do Chat

- Capturar frames do streaming e gerar GIF (10 fps):
  - `npm run capture:chat:anim`
- Capturar frames e gerar WebP animado (10 fps):
  - `npm run capture:chat:anim:webp`
- Atalho custom (respeita env `ANIM_FPS`, `ANIM_FORMAT`, `FRAME_INTERVAL_MS`, `MAX_CAPTURE_MS`):
  - `npm run capture:chat:anim:custom`
  - Exemplo rápido (GIF 12fps, 3s, frames a cada 300ms): `npm run capture:chat:anim:fast`
- Gerar animação a partir do último capture disponível:
  - GIF: `npm run anim:chat`
  - WebP: `npm run anim:chat:webp`
- Ajustes por variáveis de ambiente:
  - `ANIM_FPS`: frames por segundo (ex.: `ANIM_FPS=12`)
  - `ANIM_FORMAT`: `gif` ou `webp`
  - `FRAME_INTERVAL_MS`: intervalo entre frames (ex.: `300`)
  - `MAX_CAPTURE_MS`: duração total da captura (ex.: `3000`)

Saídas ficam em `screenshots/` com prefixo `chat-stream-<timestamp>-NNN.png` e arquivos `*-anim.gif`/`*-anim.webp`.
