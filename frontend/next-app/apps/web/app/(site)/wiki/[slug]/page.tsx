import { CATEGORIES } from "@/lib/categories"
import { CategoryView } from "./category-view"
import { EntryView } from "./entry-view"

export default async function WikiSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = CATEGORIES.find((entry) => entry.type === slug)

  if (category) {
    return <CategoryView category={category} />
  }

  return <EntryView slug={slug} />
}
