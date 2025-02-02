"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Phone, Mail, Apple, Chrome } from 'lucide-react'
import { verificationApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';


export function RepeatedVerificationStep({ onBack, apiKey }: { onBack: () => void, apiKey: string | null }) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [phoneOrEmail, setPhoneOrEmail] = useState('')
  const auth = getAuth();
  const [verificationCode, setVerificationCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [verified, setVerified] = useState(false)
  const [countdown, setCountdown] = useState(5)
    const router = useRouter()
    const { toast } = useToast();
    const [isVerifying, setIsVerifying] = useState(false)
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  useEffect(() => {
    if (verified && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, verified])

   useEffect(() => {
        const handleVerification = async () => {
           if (verified && apiKey) {
               const config = await verificationApi.validateApiKey(apiKey);
                if (!config) {
                    toast({
                        variant: "destructive",
                        title: "Chyba ověření",
                        description: "Neplatný API klíč.",
                    });
                    return;
                }
                await verificationApi.saveVerificationResult(apiKey, {
                    success: true,
                    method: "revalidate",
                    timestamp: Date.now(),
                    userId: 'test-user'
                });
                setTimeout(() => {
                    router.push("/")
                }, 5000);
        }
        }
        handleVerification();
    }, [verified, apiKey, toast, router])


  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
  }

  const handleSendCode = async () => {
    setIsSendingCode(true);
      try {
          if(recaptchaVerifierRef.current === null) {
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
              'size': 'invisible',
             });
         }
          const phoneNumber = `+420${phoneOrEmail}`;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
        setConfirmationResult(confirmation);
          toast({
            title: "Ověřovací kód byl odeslán",
            description: "Ověřovací kód byl odeslán na zadané telefonní číslo.",
            });
          setCodeSent(true)
      } catch (error: any) {
           toast({
            variant: "destructive",
            title: "Chyba odeslání",
             description: `Nepodařilo se odeslat ověřovací kód: ${error.message}`,
          });
      } finally {
          setIsSendingCode(false);
      }
  }

  const handleVerify = async () => {
      setIsVerifying(true);
    try {
         if(confirmationResult) {
            await confirmationResult.confirm(verificationCode);
            toast({
                title: "Ověření úspěšné",
                description: "Váš telefon byl úspěšně ověřen.",
            });
            setVerified(true);
         } else {
             toast({
                 variant: "destructive",
                 title: "Chyba ověření",
                 description: `Chyba ověření. Zkuste to prosím znovu.`,
             });
         }
    } catch (error: any) {
           toast({
            variant: "destructive",
            title: "Chyba ověření",
            description: `Nepodařilo se ověřit kód: ${error.message}`,
          });
    } finally {
          setIsVerifying(false);
      }
  }

  const handleOAuthVerify = () => {
    // Simulate OAuth verification process
    setVerified(true)
  }

  if (verified) {
    return (
      <Card className="max-w-md mx-auto bg-white shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Děkujeme, věk ověřen</h2>
          <p className="text-gray-light mb-6">
            Přesměrování na platbu za {countdown} sekund...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      {!selectedMethod && (
        <Button
          variant="ghost"
          className="mb-6 text-primary hover:text-primary-light"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Zpět na výběr metody
        </Button>
      )}
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          {selectedMethod && (
            <Button
              variant="ghost"
              className="mb-4 text-primary hover:text-primary-light"
              onClick={() => setSelectedMethod(null)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Zpět na výběr metody
            </Button>
          )}
          <h2 className="text-2xl font-bold text-primary mb-4">Opakované ověření</h2>
          {!selectedMethod ? (
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleMethodSelect('phone')}
              >
                <Phone className="mr-2 h-4 w-4" /> Telefon
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleMethodSelect('email')}
              >
                <Mail className="mr-2 h-4 w-4" /> Email
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleMethodSelect('apple')}
              >
                <Apple className="mr-2 h-4 w-4" /> Apple
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleMethodSelect('google')}
              >
                <Chrome className="mr-2 h-4 w-4" /> Google
              </Button>
            </div>
          ) : (selectedMethod === 'phone' || selectedMethod === 'email') ? (
            <div className="space-y-4">
              <Input
                type={selectedMethod === 'phone' ? 'tel' : 'email'}
                placeholder={selectedMethod === 'phone' ? 'Zadejte telefonní číslo' : 'Zadejte email'}
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                disabled={isSendingCode}
              />
              <Button
                className="w-full"
                onClick={handleSendCode}
                disabled={!phoneOrEmail || codeSent || isSendingCode}
              >
                {isSendingCode ? 'Odesílání...' : codeSent ? 'Ověřovací kód byl odeslán' : 'Odeslat ověřovací kód'}
              </Button>
              {codeSent && (
                <>
                  <Input
                    type="text"
                    placeholder="Zadejte ověřovací kód"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={isVerifying}
                  />
                  <Button
                    className="w-full"
                    onClick={handleVerify}
                    disabled={!verificationCode || isVerifying}
                  >
                       {isVerifying ? 'Ověřování...' : 'Potvrdit věk'}
                  </Button>
                </>
              )}
                <div id="recaptcha-container" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-gray-light">
                Klikněte pro přihlášení a ověření pomocí vašeho {selectedMethod === 'apple' ? 'Apple' : 'Google'} účtu.
              </p>
              <Button
                className="w-full"
                onClick={handleOAuthVerify}
              >
                Ověřit pomocí {selectedMethod === 'apple' ? 'Apple' : 'Google'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}