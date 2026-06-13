"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import yaml from "js-yaml"
import { ChevronDownIcon } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { cn } from "@workspace/ui/lib/utils"

import { ApiError, apiRequest } from "@/lib/api/client"
import type { EntryRead, Visibility } from "@/lib/api/types"
import { CATEGORIES } from "@/lib/categories"
import { parseFrontmatter, stringifyFrontmatter } from "@/lib/frontmatter"
import { markdownProseClassName } from "@/lib/markdown"
import { MarkdownContent } from "@/components/markdown-content"
import { VISIBILITY_META } from "@/lib/visibility"

const VISIBILITY_OPTIONS: { value: Visibility; label: string }[] = [
  { value: "public", label: "PUBLIC — доступно всем" },
  { value: "authenticated", label: "AUTHENTICATED — только авторизованным" },
  { value: "restricted", label: "RESTRICTED — по уровню допуска" },
]

const inputClassName =
  "w-full border border-input bg-neutral-900/60 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500/50 focus:outline-none"

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

  const initialFrontmatter = parseFrontmatter(entry?.content ?? "")
  const { date: initialDate, image: initialImage, ...initialExtra } = initialFrontmatter.data

  const [type, setType] = useState(defaultType)
  const [title, setTitle] = useState(entry?.title ?? "")
  const [slug, setSlug] = useState(entry?.slug ?? "")
  const [visibility, setVisibility] = useState<Visibility>(entry?.visibility ?? "public")
  const [visibilityOrgs, setVisibilityOrgs] = useState(entry?.visibility_orgs.join(", ") ?? "")
  const [body, setBody] = useState(initialFrontmatter.body)
  const [timelineDate, setTimelineDate] = useState(
    typeof initialDate === "string" ? initialDate : ""
  )
  const [image, setImage] = useState(typeof initialImage === "string" ? initialImage : "")
  const [extraYaml, setExtraYaml] = useState(
    Object.keys(initialExtra).length > 0 ? yaml.dump(initialExtra, { lineWidth: -1 }) : ""
  )
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const categoryLabel = CATEGORIES.find((category) => category.type === type)?.label ?? type
  const visibilityMeta = VISIBILITY_META[visibility]

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    let extraProperties: Record<string, unknown> = {}
    if (extraYaml.trim()) {
      try {
        const parsed = yaml.load(extraYaml)
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("not an object")
        }
        extraProperties = parsed as Record<string, unknown>
      } catch {
        setError("Дополнительные свойства должны быть валидным YAML-объектом.")
        return
      }
    }

    setSubmitting(true)

    const content = stringifyFrontmatter(
      { ...extraProperties, date: timelineDate.trim() || undefined, image: image.trim() || undefined },
      body
    )

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
    <form onSubmit={handleSubmit}>
      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border px-6 py-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            Параметры записи
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="uppercase tracking-widest text-neutral-300">
              {categoryLabel}
            </Badge>
            <Badge
              variant="outline"
              className={cn("uppercase tracking-widest", visibilityMeta.className)}
            >
              {visibilityMeta.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 px-6 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Категория">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.type} value={category.type}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Уровень доступа">
              <Select value={visibility} onValueChange={(value) => setVisibility(value as Visibility)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISIBILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Дата события (для таймлайна, ГГГГ-ММ-ДД)">
              <input
                value={timelineDate}
                onChange={(e) => setTimelineDate(e.target.value)}
                placeholder="2187-03-14"
                className={inputClassName}
              />
            </Field>
            <Field label="Изображение (URL баннера)">
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className={inputClassName}
              />
            </Field>
          </div>

          <Field label="Контент (Markdown)">
            <Tabs defaultValue="editor">
              <TabsList variant="line">
                <TabsTrigger value="editor">Редактор</TabsTrigger>
                <TabsTrigger value="preview">Превью</TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="mt-2">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={18}
                  className={`${inputClassName} font-mono`}
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-2">
                <div
                  className={cn(
                    markdownProseClassName,
                    "min-h-[28rem] border border-input bg-neutral-900/60 px-3 py-2"
                  )}
                >
                  {body.trim() ? (
                    <MarkdownContent content={body} />
                  ) : (
                    <p className="text-neutral-500">Нет содержимого для предпросмотра.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Field>

          <Collapsible>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="group/collapsible flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-amber-400"
              >
                <ChevronDownIcon className="size-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                Дополнительные параметры
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 flex flex-col gap-4">
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
              <Field label="Дополнительные свойства (YAML)">
                <textarea
                  value={extraYaml}
                  onChange={(e) => setExtraYaml(e.target.value)}
                  rows={4}
                  placeholder={"discord_role_id: \"...\"\nfaction: \"...\""}
                  className={`${inputClassName} font-mono`}
                />
              </Field>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-3 rounded-none border-t border-border bg-transparent px-6 py-4">
          {error ? <p className="mr-auto text-sm text-red-400">[ERROR]: {error}</p> : null}
          <Button type="submit" disabled={submitting} className="px-6 tracking-widest">
            {submitting ? "СОХРАНЕНИЕ..." : mode === "create" ? "[ СОЗДАТЬ ЗАПИСЬ ]" : "[ СОХРАНИТЬ ]"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
