import { test } from '@/shared/utils/test'

export default function App() {
  return (
    <div className="grid min-h-dvh place-items-center bg-zinc-950 text-zinc-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Tailwind OK</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Alias @ OK: <span className="font-mono">{test()}</span>
        </p>
      </div>
    </div>
  )
}
