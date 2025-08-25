# Modelo de Dados — Prisma

Diagrama entidade-relacionamento derivado de `prisma/schema.prisma`.

```mermaid
erDiagram
  USER ||--o{ CONVERSATION : has
  USER ||--o{ SUBSCRIPTION : has
  USER ||--o{ CREDIT_TRANSACTION : has
  USER ||--o{ PAYMENT : has
  CONVERSATION ||--o{ MESSAGE : has
  SUBSCRIPTION ||--o{ PAYMENT : links

  USER {
    string id PK
    string email UK
    string name
    string password
    int    creditBalance
    string planType
    boolean onboardingCompleted
    datetime currentPeriodStart
    datetime currentPeriodEnd
    string usageType
    string professionCategory
    string profileImage
    datetime createdAt
    datetime updatedAt
  }

  SUBSCRIPTION {
    string id PK
    string userId FK
    string status
    string plan
    datetime currentPeriodStart
    datetime currentPeriodEnd
    string stripeSubscriptionId UK
    string mercadoPagoPaymentId UK
    datetime createdAt
    datetime updatedAt
  }

  CREDIT_TRANSACTION {
    string id PK
    string userId FK
    int    amount
    string type
    datetime createdAt
  }

  CONVERSATION {
    string id PK
    string userId FK
    string title
    string modelUsed
    boolean isArchived
    boolean isPinned
    boolean isFavorite
    datetime createdAt
    datetime updatedAt
  }

  MESSAGE {
    string id PK
    string conversationId FK
    string role
    string content
    string modelUsed
    int    tokensUsed
    datetime createdAt
  }

  PAYMENT {
    string id PK
    string userId FK
    string subscriptionId FK
    float  amount
    string currency
    string status
    string provider
    string paymentMethod
    string externalId UK
    string mercadoPagoPaymentId UK
    string creditPackageId
    datetime createdAt
  }

  MERCADOPAGO_WEBHOOK_LOG {
    string id PK
    string body
    string headers
    string status
    datetime createdAt
    datetime updatedAt
  }

  CREDIT_PACKAGE {
    string id PK
    string name UK
    int    credits
    float  price
    string currency
    string planType
    datetime createdAt
  }
```

Observações
- Índices e constraints de unicidade seguem o schema Prisma (verifique `@@index`/`@unique`).
- A funcionalidade de telemetria de uso (`lib/usage-limits.ts`) pode depender de uma tabela opcional `UserUsage` não presente no schema atual; em deploys sem essa tabela, o rastreamento é automaticamente ignorado.

