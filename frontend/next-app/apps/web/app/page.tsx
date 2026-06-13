import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-medium">AETHER</h1>
      <p className="text-muted-foreground">
        База знаний по проекту Eclipse Protocol.
      </p>
      <Button asChild className="w-fit">
        <Link href="/wiki">Перейти в Wiki</Link>
      </Button>
    </div>
  )
}
