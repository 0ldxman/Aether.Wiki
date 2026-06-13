import { Building2, CalendarClock, Cpu, Flag, MapPin, Tag, User, type LucideIcon } from "lucide-react"

export const CATEGORIES = [
  { type: "event", label: "СОБЫТИЯ", icon: CalendarClock },
  { type: "technology", label: "ТЕХНОЛОГИИ", icon: Cpu },
  { type: "location", label: "ЛОКАЦИИ", icon: MapPin },
  { type: "country", label: "СТРАНЫ", icon: Flag },
  { type: "organization", label: "ОРГАНИЗАЦИИ", icon: Building2 },
  { type: "character", label: "ЛИЧНОСТИ", icon: User },
] as const

export const CATEGORY_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORIES.map((category) => [category.type, category.icon])
)

export const DEFAULT_CATEGORY_ICON: LucideIcon = Tag
