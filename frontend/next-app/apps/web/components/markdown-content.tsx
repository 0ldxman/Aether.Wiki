import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { resolveWikilinks, stripFrontmatter } from "@/lib/markdown"

export function MarkdownContent({ content }: { content: string }) {
  const processed = resolveWikilinks(stripFrontmatter(content))

  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{processed}</ReactMarkdown>
}
