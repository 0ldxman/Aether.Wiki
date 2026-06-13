const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/

/** Strip the leading YAML frontmatter block, mirroring app/services/content.py::extract_properties. */
export function stripFrontmatter(content: string): string {
  return content.replace(FRONTMATTER_RE, "")
}

// Cyrillic -> Latin transliteration, matching the table used by text-unidecode
// (the library behind python-slugify on the backend).
const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
}

/** Slugify a string, matching python-slugify's default output for Cyrillic/Latin titles. */
export function slugify(text: string): string {
  const transliterated = text
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_MAP[char] ?? char)
    .join("")

  return transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const WIKILINK_RE = /\[\[(.+?)\]\]/g

/** Replace [[Target]] / [[Target->Display]] wikilinks with markdown links to /wiki/<slug>. */
export function resolveWikilinks(content: string): string {
  return content.replace(WIKILINK_RE, (_match, inner: string) => {
    const [target = "", display] = inner.split("->").map((part) => part.trim())
    const label = display || target
    return `[${label}](/wiki/${slugify(target)})`
  })
}
