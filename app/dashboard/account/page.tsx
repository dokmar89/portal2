import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { AccountForm } from "@/components/account-form"

export default function AccountPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Účet" text="Spravujte nastavení svého účtu" />
      <AccountForm />
    </DashboardShell>
  )
}

