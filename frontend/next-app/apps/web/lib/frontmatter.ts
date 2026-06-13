import yaml from "js-yaml"

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

export interface ParsedFrontmatter {
  data: Record<string, unknown>
  body: string
}

/** Split markdown content into its YAML frontmatter (if any) and body. */
export function parseFrontmatter(content: string): ParsedFrontmatter {
  const match = FRONTMATTER_RE.exec(content)
  if (!match) {
    return { data: {}, body: content }
  }

  const [, rawYaml, body] = match
  try {
    const data = yaml.load(rawYaml ?? "")
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return { data: data as Record<string, unknown>, body: body ?? "" }
    }
  } catch {
    // fall through to "no frontmatter" if the block doesn't parse
  }
  return { data: {}, body: content }
}

/** Reassemble markdown content from a properties object and a body. */
export function stringifyFrontmatter(data: Record<string, unknown>, body: string): string {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined && value !== "")
  if (entries.length === 0) {
    return body
  }

  const yamlBlock = yaml.dump(Object.fromEntries(entries), { lineWidth: -1 })
  return `---\n${yamlBlock}---\n\n${body.replace(/^\n+/, "")}`
}
