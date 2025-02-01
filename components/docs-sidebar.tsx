import Link from "next/link"
import { Button } from "@/components/ui/button"

export function DocsSidebar() {
  const sections = [
    { title: "Getting Started", href: "#getting-started" },
    { title: "API Reference", href: "#api-reference" },
    { title: "Integration Guide", href: "#integration-guide" },
    { title: "SDK Documentation", href: "#sdk-documentation" },
    { title: "FAQs", href: "#faqs" },
  ]

  return (
    <nav className="w-64 pr-8">
      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.href}>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href={section.href}>{section.title}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

