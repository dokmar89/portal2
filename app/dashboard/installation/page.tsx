import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { InstallationGuide } from "@/components/installation-guide"

export default function InstallationPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Installation" text="Install PassProve on your e-shop" />
      <InstallationGuide />
    </DashboardShell>
  )
}

