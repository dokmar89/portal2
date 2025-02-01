"use client"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { SupportTickets } from "@/components/support-tickets"
import { FAQSection } from "@/components/faq-section"

export default function SupportPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Podpora" text="Získejte pomoc a podporu pro PassProve" />
      <div className="grid gap-4">
        <SupportTickets />
        <FAQSection />
      </div>
    </DashboardShell>
  )
}

