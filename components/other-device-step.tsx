import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { verificationApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';

export function OtherDeviceStep({ onBack, apiKey }: { onBack: () => void, apiKey: string | null }) {
  const [verificationComplete, setVerificationComplete] = useState(false)
  const [progress, setProgress] = useState(0)
    const { toast } = useToast();
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>("pending");
    const [unsubscribe, setUnsubscribe] = useState<() => void | null>(null);


    useEffect(() => {
        const generateVerificationId = () => {
            const id = uuidv4();
            setVerificationId(id);
            // Generate the full URL here
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const verificationUrl = `${baseUrl}?verificationId=${id}&apiKey=${apiKey}`;
            setQrCodeData(verificationUrl);
        }
        generateVerificationId();
    },[apiKey])
    
    useEffect(() => {
        if(apiKey && verificationId) {
            const docRef = doc(db, "qrVerifications", verificationId);
            const unsub = onSnapshot(docRef, (doc) => {
                if (doc.exists()) {
                    setStatus(doc.data().status);
                    if (doc.data().status === "completed" || doc.data().status === "rejected" || doc.data().status === "failed") {
                        setVerificationComplete(true);
                            if (apiKey && doc.data().status === "completed") {
                                verificationApi.saveVerificationResult(apiKey, {
                                    success: true,
                                    method: "other_device",
                                    timestamp: Date.now(),
                                    userId: 'test-user',
                                    verificationId: verificationId
                                });
                            }
                    }
                }
            });
            setUnsubscribe(() => unsub);
            return () => unsub();
        }
    }, [apiKey, verificationId, toast])

    useEffect(() => {
        const createVerificationRecord = async () => {
            if (apiKey && verificationId) {
                try {
                    await setDoc(doc(db, "qrVerifications", verificationId), {
                        apiKey: apiKey,
                        status: "pending",
                        createdAt: Timestamp.now(),
                    });
                } catch (error: any) {
                    toast({
                        variant: "destructive",
                        title: "Chyba",
                        description: `Nepodařilo se vytvořit záznam o ověření: ${error.message}`,
                    });
                }
            }
        };
        createVerificationRecord();
    }, [apiKey, verificationId, toast]);

  useEffect(() => {
    if (!verificationComplete) {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval)
            return 100
          }
          return prevProgress + 10
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [verificationComplete])
    

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
          <h2 className="text-2xl font-bold text-primary mb-4">Ověření na jiném zařízení</h2>
          <p className="text-gray-light mb-6">
            Naskenujte QR kód pomocí svého mobilního zařízení a dokončete proces ověření.
          </p>
          <div className="flex justify-center mb-6">
            {qrCodeData && <QRCodeSVG value={qrCodeData} size={200} />}
          </div>
          {!verificationComplete ? (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          ) : (
            <p className="text-center text-green-600 font-semibold">
              Ověření bylo úspěšně dokončeno na jiném zařízení.
            </p>
          )}
            {status && status !== "pending" && (
                <p className="text-center text-primary font-semibold">
                    Stav: {status}
                </p>
            )}
        </CardContent>
      </Card>
    </div>
  )
}