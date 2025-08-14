export default async function TestDynamicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Test Dynamic Page</h1>
      <p>ID from URL: {id}</p>
    </div>
  )
}