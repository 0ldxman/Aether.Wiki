/** Tailwind utility classes that style raw HTML produced by ReactMarkdown. */
export const markdownProseClassName =
  "space-y-4 text-sm leading-relaxed text-neutral-300 " +
  "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-wide [&_h1]:text-amber-400 " +
  "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-wide [&_h2]:text-amber-400 " +
  "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-neutral-200 " +
  "[&_a]:text-amber-400 [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 " +
  "[&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-amber-500/40 [&_blockquote]:pl-4 [&_blockquote]:text-neutral-400 " +
  "[&_code]:bg-neutral-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-amber-300 " +
  "[&_strong]:text-neutral-100 " +
  "[&_hr]:border-neutral-800 " +
  "[&_table]:w-full [&_th]:border [&_th]:border-neutral-700 [&_th]:p-2 [&_td]:border [&_td]:border-neutral-700 [&_td]:p-2"

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
