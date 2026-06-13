import { SiteHeader } from "@/components/site-header"

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <SiteHeader />
      <main className="container mx-auto p-4">{children}</main>
    </>
  )
}
