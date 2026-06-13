"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"

import { ApiError, apiRequest } from "@/lib/api/client"

export function DeleteEntryDialog({
  entryId,
  title,
  redirectTo,
}: {
  entryId: string
  title: string
  redirectTo: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setError(null)
    setDeleting(true)

    try {
      await apiRequest<void>(`/api/entries/${entryId}`, { method: "DELETE" })
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось удалить запись.")
      setDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" className="tracking-widest">
          [ УДАЛИТЬ ]
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
          <AlertDialogDescription>
            Запись «{title}» и все связанные с ней wiki-ссылки будут удалены без возможности
            восстановления.
            {error ? <span className="mt-2 block text-red-400">[ERROR]: {error}</span> : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Удаление..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
