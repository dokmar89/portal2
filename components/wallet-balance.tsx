"use client"

import { useState, useEffect } from "react"
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
import QRCode from "react-qr-code"
import { jsPDF } from "jspdf"
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp, setDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WalletBalance() {
    const [balance, setBalance] = useState(0);
    const [selectedAmount, setSelectedAmount] = useState(0)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const { toast } = useToast()
    const { user } = useAuth();
    const [loading, setLoading] = useState(true); // Add loading state

  const presetAmounts = [500, 1000, 2000, 5000]

    useEffect(() => {
        const fetchWallet = async () => {
            if (user?.uid) {
                try {
                    const token = await user.getIdToken();
                    const response = await fetch('/api/getWalletBalance', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ data: { companyId: user.uid } })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setBalance(data.data);
                    } else {
                        const errorData = await response.json();
                        toast({
                            variant: "destructive",
                            title: "Chyba",
                            description: `Nepodařilo se načíst peněženku: ${errorData.error}`,
                        });
                        setBalance(0);
                    }
                } catch (error) {
                    console.error("Error fetching wallet:", error);
                    toast({
                        variant: "destructive",
                        title: "Chyba",
                        description: "Nepodařilo se načíst peněženku.",
                    });
                       setBalance(0);
                } finally {
                    setLoading(false);
                }

            }
        };
        fetchWallet();
    }, [user]);

  const handleRecharge = async () => {
    try {
      if(user?.uid) {
        const token = await user.getIdToken();
        const response = await fetch('/api/processPayment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ data: { companyId: user.uid, amount: selectedAmount } })
        });
        if (response.ok) {
          const data = await response.json();
          setBalance(data.newBalance);
          setShowConfirmation(false)
            generateInvoice(selectedAmount);
        } else {
          const errorData = await response.json();
          toast({
            variant: "destructive",
            title: "Chyba",
            description: `Nepodařilo se dobít peněženku: ${errorData.error}`,
          });
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Chyba",
        description: `Nepodařilo se dobít peněženku: ${error.message}`,
      });
    }
  }

  const generateInvoice = (amount: number) => {
    const doc = new jsPDF()
    const invoiceNumber = `INV-${Date.now()}`
    const date = new Date().toLocaleDateString('cs-CZ')

    doc.setFontSize(18)
    doc.text('Faktura', 105, 20, { align: 'center' })

    doc.setFontSize(12)
    doc.text(`Číslo faktury: ${invoiceNumber}`, 20, 40)
    doc.text(`Datum: ${date}`, 20, 50)
    doc.text(`Částka: ${amount} Kč`, 20, 60)
    doc.text('Děkujeme za dobití kreditu v PassProve.', 20, 80)

    const pdfBlob = doc.output('blob')
    const url = URL.createObjectURL(pdfBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `faktura-${invoiceNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Faktura vygenerována",
      description: "Faktura byla vygenerována a stažení by mělo začít automaticky.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zůstatek peněženky</CardTitle>
      </CardHeader>
        <CardContent>
            {loading ? (
                <p>Načítání zůstatku...</p>
            ) : (
                <>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(balance)}</div>
            <p className="text-xs text-muted-foreground mb-4">
              Dostupné pro verifikace
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Dobít kredit</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dobít peněženku</DialogTitle>
                  <DialogDescription>
                    Vyberte částku, kterou chcete přidat do své peněženky.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-4">
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      onClick={() => setSelectedAmount(amount)}
                    >
                      {amount} Kč
                    </Button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="custom-amount">Vlastní částka</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="Zadejte částku"
                      onChange={(e) => setSelectedAmount(Number(e.target.value))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowConfirmation(true)}>
                    Pokračovat k platbě
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Potvrdit platbu</DialogTitle>
                  <DialogDescription>
                    Naskenujte QR kód nebo použijte platební údaje níže pro dokončení transakce.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-4">
                  <QRCode value={`https://payment.example.com/${selectedAmount}`} />
                </div>
                <div className="space-y-2">
                  <p><strong>Částka:</strong> {selectedAmount} Kč</p>
                  <p><strong>Číslo účtu:</strong> 1234567890/0100</p>
                  <p><strong>Variabilní symbol:</strong> 123456</p>
                </div>
                <DialogFooter>
                  <Button onClick={handleRecharge}>Potvrdit platbu</Button>
                  <Button variant="outline" onClick={() => setShowConfirmation(false)}>Zrušit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
                    </>
            )}
        </CardContent>
    </Card>
  )
}