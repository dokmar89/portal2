import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { WalletBalance } from "@/components/wallet-balance"
import { TransactionHistory } from "@/components/transaction-history"
import { InvoiceList } from "@/components/invoice-list"

export default function WalletPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Peněženka" text="Spravujte svou peněženku a zobrazujte historii transakcí" />
      <div className="grid gap-4">
        <WalletBalance />
        <TransactionHistory />
        <InvoiceList />
      </div>
    </DashboardShell>
  )
}

