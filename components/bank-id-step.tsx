import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import { VerificationResult } from './verification-result'
import { verificationApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function BankIDStep({ onBack, apiKey }: { onBack: () => void, apiKey: string | null }) {
  const [bankName, setBankName] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [saveResult, setSaveResult] = useState(false)
    const { toast } = useToast();


  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    // Simulate verification process
    setTimeout(async () => {
      setIsVerifying(false)
      setIsVerified(true)
        if(apiKey) {
            const config = await verificationApi.validateApiKey(apiKey);
            if (!config) {
                toast({
                    variant: "destructive",
                    title: "Chyba ověření",
                    description: "Neplatný API klíč.",
                });
                setIsVerified(false);
                return;
            }
          await verificationApi.saveVerificationResult(apiKey, {
            success: true,
            method: "bankid",
            timestamp: Date.now(),
             userId: 'test-user'
          })
        }
    }, 3000)
  }

  return (
    <div className="max-w-md mx-auto">
      <Button
        variant="ghost"
        className="mb-6 text-primary hover:text-primary-light"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Zpět na výběr metody
      </Button>
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">BankID</h2>
          <p className="text-gray-light mb-6">
            Pro ověření věku pomocí BankID zadejte název vaší banky. Budete přesměrováni na přihlašovací stránku vaší banky.
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Label htmlFor="bankName" className="text-gray-dark">Název banky</Label>
              <Input
                id="bankName"
                type="text"
                placeholder="Např. Česká spořitelna, ČSOB, Komerční banka"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="mt-1 border-primary-light focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary text-white hover:bg-primary/90"
              disabled={isVerifying || isVerified}
            >
              {isVerifying ? 'Ověřování...' : isVerified ? 'Ověřeno' : 'Pokračovat k bance'}
              <CreditCard className="ml-2 h-4 w-4" />
            </Button>
          </form>
          {isVerified && <VerificationResult isVerified={true} />}
        </CardContent>
      </Card>
    </div>
  )
}