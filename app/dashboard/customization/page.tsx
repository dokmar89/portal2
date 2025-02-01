import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { CustomizationForm } from "@/components/customization-form"

export default function CustomizationPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Přizpůsobení" text="Upravte proces ověření věku pro váš e-shop" />
      <CustomizationForm />
    </DashboardShell>
  )
}

