"use client"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { DocsSidebar } from "@/components/docs-sidebar"
import { DocsContent } from "@/components/docs-content"

export default function DocsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Documentation" text="API and integration guides" />
      <div className="flex flex-col md:flex-row">
        <DocsSidebar />
        <DocsContent />
      </div>
    </DashboardShell>
  )
}

