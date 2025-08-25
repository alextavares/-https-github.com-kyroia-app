export default function NotFound() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold">Página não encontrada</h2>
      <a className="px-3 py-2 rounded-md border" href="/dashboard">Voltar ao Dashboard</a>
    </div>
  )
}

