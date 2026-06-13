import Link from "next/link"

import { CATEGORIES } from "@/lib/categories"

export function CategoryNav() {
  return (
    <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {CATEGORIES.map((category) => {
        const Icon = category.icon
        return (
          <Link
            key={category.type}
            href={`/wiki/${category.type}`}
            className="flex items-center gap-1.5 text-xs tracking-[0.2em] text-neutral-400 transition-colors hover:text-amber-400"
          >
            <Icon className="size-3.5" />
            {category.label}
          </Link>
        )
      })}
    </nav>
  )
}
