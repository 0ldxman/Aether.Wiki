"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { ApiError, apiRequest } from "@/lib/api/client"
import type { EntryRead, Visibility } from "@/lib/api/types"
import { CATEGORIES } from "@/lib/categories"

const VISIBILITY_OPTIONS: { value: Visibility; label: string }[] = [
  { value: "public", label: "PUBLIC — доступно всем" },
  { value: "authenticated", label: "AUTHENTICATED — только авторизованным" },
  { value: "restricted", label: "RESTRICTED — по уровню допуска" },
]

const inputClassName =
  "w-full border border-neutral-700/80 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500/50 focus:outline-none"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</label>
      {children}
    </div>
  )
}

export function EntryForm({
  mode,
  entry,
  initialType,
}: {
  mode: "create" | "edit"
  entry?: EntryRead
  initialType?: string
}) {
  const router = useRouter()

  const defaultType =
    entry?.type ??
    (initialType && CATEGORIES.some((category) => category.type === initialType)
      ? initialType
      : CATEGORIES[0].type)

  const [type, setType] = useState(defaultType)
  const [title, setTitle] = useState(entry?.title ?? "")
  const [slug, setSlug] = useState(entry?.slug ?? "")
  const [visibility, setVisibility] = useState<Visibility>(entry?.visibility ?? "public")
  const [visibilityOrgs, setVisibilityOrgs] = useState(entry?.visibility_orgs.join(", ") ?? "")
  const [content, setContent] = useState(entry?.content ?? "")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const payload = {
      type,
      title,
      slug: slug.trim() || undefined,
      content,
      visibility,
      visibility_orgs: visibilityOrgs
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    }

    try {
      const result =
        mode === "create"
          ? await apiRequest<EntryRead>("/api/entries", {
              method: "POST",
              body: JSON.stringify(payload),
            })
          : await apiRequest<EntryRead>(`/api/entries/${entry!.id}`, {
              method: "PATCH",
              body: JSON.stringify(payload),
            })

      router.push(`/wiki/${result.slug ?? result.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось сохранить запись.")
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 border border-neutral-700/80 bg-neutral-900/40 p-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Категория">
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClassName}>
            {CATEGORIES.map((category) => (
              <option key={category.type} value={category.type}>
                {category.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Уровень доступа">
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className={inputClassName}
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Название">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClassName}
        />
      </Field>

      <Field label="Slug (необязательно — генерируется из названия)">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto"
          className={inputClassName}
        />
      </Field>

      <Field label="Доступ для организаций (UUID через запятую)">
        <input
          value={visibilityOrgs}
          onChange={(e) => setVisibilityOrgs(e.target.value)}
          className={inputClassName}
        />
      </Field>

      <Field label="Контент (Markdown + YAML frontmatter)">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className={`${inputClassName} font-mono`}
        />
      </Field>

      {error ? <p className="text-sm text-red-400">[ERROR]: {error}</p> : null}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="border border-amber-500/40 px-6 py-2 text-sm tracking-widest text-amber-400 transition-colors hover:bg-amber-500/10 disabled:opacity-50"
        >
          {submitting ? "СОХРАНЕНИЕ..." : mode === "create" ? "[ СОЗДАТЬ ЗАПИСЬ ]" : "[ СОХРАНИТЬ ]"}
        </button>
      </div>
    </form>
  )
}
