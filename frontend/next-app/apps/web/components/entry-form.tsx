"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import yaml from "js-yaml"

import { Button } from "@workspace/ui/components/button"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
} from "@workspace/ui/components/combobox"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Textarea } from "@workspace/ui/components/textarea"
import { TerminalWindow } from "@workspace/ui/components/terminal-window"
import { cn } from "@workspace/ui/lib/utils"

import { ApiError, apiRequest } from "@/lib/api/client"
import type { EntryRead, Visibility } from "@/lib/api/types"
import { CATEGORIES } from "@/lib/categories"
import { MarkdownContent } from "@/components/markdown-content"
import { MarkdownToolbar } from "@/components/markdown-toolbar"
import { parseFrontmatter, stringifyFrontmatter } from "@/lib/frontmatter"
import { markdownProseClassName } from "@/lib/markdown"
import { VISIBILITY_META } from "@/lib/visibility"

const VISIBILITY_OPTIONS: { value: Visibility; label: string }[] = [
  { value: "public", label: "PUBLIC — доступно всем" },
  { value: "authenticated", label: "AUTHENTICATED — только авторизованным" },
  { value: "restricted", label: "RESTRICTED — по уровню допуска" },
]

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const defaultType =
    entry?.type ??
    (initialType && CATEGORIES.some((category) => category.type === initialType)
      ? initialType
      : CATEGORIES[0].type)

  const initialFrontmatter = parseFrontmatter(entry?.content ?? "")
  const { image: initialImage, tags: initialTags, ...initialExtra } = initialFrontmatter.data

  const [type, setType] = useState(defaultType)
  const [title, setTitle] = useState(entry?.title ?? "")
  const [slug, setSlug] = useState(entry?.slug ?? "")
  const [visibility, setVisibility] = useState<Visibility>(entry?.visibility ?? "public")
  const [visibilityOrgs, setVisibilityOrgs] = useState(entry?.visibility_orgs.join(", ") ?? "")
  const [body, setBody] = useState(initialFrontmatter.body)
  const [image, setImage] = useState(typeof initialImage === "string" ? initialImage : "")
  const [tags, setTags] = useState<string[]>(
    Array.isArray(initialTags) ? initialTags.map(String) : []
  )
  const [tagDraft, setTagDraft] = useState("")
  const [extraYaml, setExtraYaml] = useState(
    Object.keys(initialExtra).length > 0 ? yaml.dump(initialExtra, { lineWidth: -1 }) : ""
  )
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const slugDisplay = slug.trim() ? slug.trim().toUpperCase() : "NEW"
  const contentTitle = `ECL:/DTA/${type.toUpperCase()}/${slugDisplay}`
  const metaTitle = `${contentTitle}::META`

  function commitTagDraft() {
    const next = tagDraft.trim()
    setTagDraft("")
    if (!next || tags.includes(next)) return
    setTags([...tags, next])
  }

  function handleTagKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      commitTagDraft()
    } else if (event.key === "Backspace" && tagDraft === "" && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

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
        setError("Frontmatter должен быть валидным YAML-объектом.")
        return
      }
    }

    setSubmitting(true)

    const content = stringifyFrontmatter(
      {
        ...extraProperties,
        image: image.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      },
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <TerminalWindow title={contentTitle} contentClassName="p-0" className="lg:col-span-2">
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-end">
            <Field label="Название" className="flex-1">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Field>
            <Field label="Категория" className="sm:w-56">
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
          </div>

          <Tabs defaultValue="editor" className="gap-0">
            <div className="sticky top-16 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card">
              <MarkdownToolbar textareaRef={textareaRef} onChange={setBody} className="border-b-0" />
              <TabsList variant="line" className="mr-2">
                <TabsTrigger value="editor">Редактор</TabsTrigger>
                <TabsTrigger value="preview">Превью</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="editor" className="mt-0">
              <Textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[32rem] resize-none border-0 font-mono"
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-0">
              <div className={cn(markdownProseClassName, "min-h-[32rem] p-4")}>
                {body.trim() ? (
                  <MarkdownContent content={body} />
                ) : (
                  <p className="text-muted-foreground">Нет содержимого для предпросмотра.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TerminalWindow>

        <TerminalWindow title={metaTitle} contentClassName="flex flex-col gap-4">
          <Field label="Slug">
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto"
            />
          </Field>

          <Field label="Баннер (URL)">
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </Field>

          <Field label="Теги">
            <Combobox
              multiple
              items={tags}
              value={tags}
              onValueChange={setTags}
              inputValue={tagDraft}
              onInputValueChange={setTagDraft}
            >
              <ComboboxChips>
                {tags.map((tag) => (
                  <ComboboxChip key={tag}>{tag}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  onKeyDown={handleTagKeyDown}
                  onBlur={commitTagDraft}
                  placeholder={tags.length === 0 ? "Добавить тег..." : undefined}
                />
              </ComboboxChips>
            </Combobox>
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
            <p className={cn("text-xs uppercase tracking-widest", VISIBILITY_META[visibility].className)}>
              {VISIBILITY_META[visibility].label}
            </p>
          </Field>

          {visibility === "restricted" ? (
            <Field label="Доступ для организаций (UUID через запятую)">
              <Input value={visibilityOrgs} onChange={(e) => setVisibilityOrgs(e.target.value)} />
            </Field>
          ) : null}

          <Field label="Frontmatter (YAML)" className="flex-1">
            <Textarea
              value={extraYaml}
              onChange={(e) => setExtraYaml(e.target.value)}
              placeholder={"date: 2187-03-14\nfaction: \"...\""}
              className="min-h-40 font-mono"
            />
          </Field>
        </TerminalWindow>
      </div>

      <div className="flex items-center justify-end gap-3">
        {error ? <p className="mr-auto text-sm text-red-400">[ERROR]: {error}</p> : null}
        <Button type="submit" disabled={submitting} className="px-6 tracking-widest">
          {submitting ? "СОХРАНЕНИЕ..." : mode === "create" ? "[ СОЗДАТЬ ЗАПИСЬ ]" : "[ СОХРАНИТЬ ]"}
        </Button>
      </div>
    </form>
  )
}
