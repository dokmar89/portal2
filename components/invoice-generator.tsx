"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext";

export function InvoiceGenerator() {
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const { toast } = useToast()
  const { user } = useAuth();

  const handleGenerateInvoice = async () => {
    if(user?.uid) {
        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/generateInvoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ data: { companyId: user.uid, amount: 1000, invoiceNumber: invoiceNumber } })
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `faktura-${invoiceNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast({
                  title: "Faktura vygenerována",
                  description: "Vaše faktura byla vygenerována a je připravena ke stažení.",
                })
            } else {
                const errorData = await response.json();
                toast({
                    variant: "destructive",
                    title: "Chyba",
                    description: `Nepodařilo se vygenerovat fakturu: ${errorData.error}`,
                });
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Chyba",
                description: `Nepodařilo se vygenerovat fakturu: ${error.message}`,
            });
        }
    } else {
        toast({
            variant: "destructive",
            title: "Chyba",
            description: "Uživatel není přihlášen",
        });
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Generovat fakturu</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generovat fakturu</DialogTitle>
          <DialogDescription>
            Zadejte číslo faktury pro vygenerování a stažení faktury.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="invoiceNumber" className="text-right">
              Číslo faktury
            </Label>
            <Input
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleGenerateInvoice}>Generovat a stáhnout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}