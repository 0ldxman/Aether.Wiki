import { SiteHeader } from "@/components/site-header"

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-neutral-950 font-mono text-neutral-300">
      <SiteHeader />
      <main className="container mx-auto p-4">{children}</main>
    </div>
  )
}
