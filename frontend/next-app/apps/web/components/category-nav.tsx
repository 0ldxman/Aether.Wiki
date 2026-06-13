import Link from "next/link"

import { CATEGORIES } from "@/lib/categories"

export function CategoryNav() {
  return (
    <nav className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <Link
          key={category.type}
          href={`/wiki/${category.type}`}
          className="border border-neutral-700/80 bg-neutral-900/40 px-4 py-2 text-xs tracking-[0.2em] text-neutral-400 transition-colors hover:border-amber-500/50 hover:text-amber-400"
        >
          {category.label}
        </Link>
      ))}
    </nav>
  )
}
