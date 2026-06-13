import Link from "next/link"

import { CATEGORIES } from "@/lib/categories"

export function CategoryNav() {
  return (
    <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {CATEGORIES.map((category) => (
        <Link
          key={category.type}
          href={`/wiki/${category.type}`}
          className="text-xs tracking-[0.2em] text-neutral-400 transition-colors hover:text-amber-400"
        >
          {category.label}
        </Link>
      ))}
    </nav>
  )
}
