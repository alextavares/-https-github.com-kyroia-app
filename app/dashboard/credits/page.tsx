export default function CreditsPage() {
  return (
    <div className="py-8 px-4 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Créditos</h1>
      <p className="text-muted-foreground">
        Aqui você acompanha seu saldo de créditos e acessa histórico e compras.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <a className="text-primary underline" href="/dashboard/credits/history">Histórico de créditos</a>
        </li>
        <li>
          <a className="text-primary underline" href="/dashboard/credits/purchase">Comprar créditos</a>
        </li>
        <li>
          <a className="text-primary underline" href="/dashboard/credits/payment">Pagamentos</a>
        </li>
      </ul>
    </div>
  )
}

