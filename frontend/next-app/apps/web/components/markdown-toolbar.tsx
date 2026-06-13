"use client"

import {
  Bold,
  Clock,
  Italic,
  Link2,
  type LucideIcon,
  Puzzle,
  Quote,
  Strikethrough,
  Table2,
  Underline,
  EyeOff,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"

type MarkdownAction =
  | { kind: "wrap"; before: string; after?: string }
  | { kind: "line-prefix"; prefix: string }
  | { kind: "link" }
  | { kind: "table" }
  | { kind: "timestamp" }
  | { kind: "widget" }

interface ToolbarTool {
  label: string
  icon: LucideIcon
  action: MarkdownAction
}

const TOOLS: ToolbarTool[] = [
  { label: "Жирный", icon: Bold, action: { kind: "wrap", before: "**" } },
  { label: "Курсив", icon: Italic, action: { kind: "wrap", before: "_" } },
  {
    label: "Подчёркивание",
    icon: Underline,
    action: { kind: "wrap", before: "<u>", after: "</u>" },
  },
  { label: "Перечёркивание", icon: Strikethrough, action: { kind: "wrap", before: "~~" } },
  { label: "Ссылка", icon: Link2, action: { kind: "link" } },
  { label: "Спойлер", icon: EyeOff, action: { kind: "wrap", before: "||" } },
  { label: "Цитата", icon: Quote, action: { kind: "line-prefix", prefix: "> " } },
  { label: "Таблица", icon: Table2, action: { kind: "table" } },
  { label: "Таймстамп", icon: Clock, action: { kind: "timestamp" } },
  { label: "Виджет", icon: Puzzle, action: { kind: "widget" } },
]

function applyAction(
  textarea: HTMLTextAreaElement,
  action: MarkdownAction
): { value: string; selectionStart: number; selectionEnd: number } {
  const { value, selectionStart, selectionEnd } = textarea
  const selected = value.slice(selectionStart, selectionEnd)

  switch (action.kind) {
    case "wrap": {
      const before = action.before
      const after = action.after ?? action.before
      const alreadyWrapped =
        selected.length >= before.length + after.length &&
        selected.startsWith(before) &&
        selected.endsWith(after)

      if (alreadyWrapped) {
        const inner = selected.slice(before.length, selected.length - after.length)
        return {
          value: value.slice(0, selectionStart) + inner + value.slice(selectionEnd),
          selectionStart,
          selectionEnd: selectionStart + inner.length,
        }
      }

      return {
        value: value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd),
        selectionStart: selectionStart + before.length,
        selectionEnd: selectionStart + before.length + selected.length,
      }
    }
    case "line-prefix": {
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1
      const nextBreak = value.indexOf("\n", selectionEnd)
      const lineEnd = nextBreak === -1 ? value.length : nextBreak
      const block = value.slice(lineStart, lineEnd)
      const lines = block.split("\n")
      const allPrefixed = lines.every((line) => line.startsWith(action.prefix))
      const newLines = allPrefixed
        ? lines.map((line) => line.slice(action.prefix.length))
        : lines.map((line) => action.prefix + line)
      const newBlock = newLines.join("\n")
      const delta = newBlock.length - block.length
      return {
        value: value.slice(0, lineStart) + newBlock + value.slice(lineEnd),
        selectionStart: Math.max(
          lineStart,
          selectionStart + (allPrefixed ? -action.prefix.length : action.prefix.length)
        ),
        selectionEnd: selectionEnd + delta,
      }
    }
    case "link": {
      const text = selected || "ссылка"
      const insertion = `[${text}](url)`
      const urlOffset = insertion.lastIndexOf("url")
      return {
        value: value.slice(0, selectionStart) + insertion + value.slice(selectionEnd),
        selectionStart: selectionStart + urlOffset,
        selectionEnd: selectionStart + urlOffset + "url".length,
      }
    }
    case "table": {
      const template =
        "\n| Заголовок 1 | Заголовок 2 |\n| --- | --- |\n| Значение | Значение |\n"
      const insertAt = selectionEnd
      return {
        value: value.slice(0, insertAt) + template + value.slice(insertAt),
        selectionStart: insertAt + template.length,
        selectionEnd: insertAt + template.length,
      }
    }
    case "timestamp": {
      const stamp = new Date().toISOString()
      return {
        value: value.slice(0, selectionStart) + stamp + value.slice(selectionEnd),
        selectionStart: selectionStart + stamp.length,
        selectionEnd: selectionStart + stamp.length,
      }
    }
    case "widget": {
      const placeholder = "{{widget:name}}"
      const nameOffset = placeholder.indexOf("name")
      return {
        value: value.slice(0, selectionStart) + placeholder + value.slice(selectionEnd),
        selectionStart: selectionStart + nameOffset,
        selectionEnd: selectionStart + nameOffset + "name".length,
      }
    }
  }
}

export function MarkdownToolbar({
  textareaRef,
  onChange,
  className,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onChange: (value: string) => void
  className?: string
}) {
  function handleClick(action: MarkdownAction) {
    const textarea = textareaRef.current
    if (!textarea) return

    const result = applyAction(textarea, action)
    onChange(result.value)

    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd)
    })
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1 border-b border-border bg-card p-1", className)}>
      {TOOLS.map((tool, index) => (
        <span key={tool.label} className="flex items-center gap-1">
          {index === 5 ? <Separator orientation="vertical" className="mx-1 h-5" /> : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title={tool.label}
            aria-label={tool.label}
            onClick={() => handleClick(tool.action)}
          >
            <tool.icon />
          </Button>
        </span>
      ))}
    </div>
  )
}
