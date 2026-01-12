import { useParams } from 'react-router-dom'

export default function DebtDetailPage() {
  const { id } = useParams()

  return (
    <div>
      <h2 className="text-2xl font-bold">Detalle de deuda</h2>
      <p className="mt-2 text-sm text-zinc-400">ID: {id}</p>
    </div>
  )
}
