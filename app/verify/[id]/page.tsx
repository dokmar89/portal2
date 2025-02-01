"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BankIDStep } from '@/components/bank-id-step';
import { MojeIDStep } from '@/components/moje-id-step';
import { IDScanStep } from '@/components/id-scan-step';
import { FaceScanStep } from '@/components/face-scan-step';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface VerificationMethod {
    id: string;
    title: string;
    description: string;
}

const verificationMethods: VerificationMethod[] = [
    {
        id: "facescan",
        title: "FaceScan",
        description:
            "Rychlé a bezpečné ověření pomocí skenování obličeje. Není potřeba žádný doklad, stačí pouze váš obličej.",
    },
    {
        id: "bankid",
        title: "BankID",
        description:
            "Ověření pomocí vaší bankovní identity. Bezpečný způsob s využitím vašeho internetového bankovnictví.",
    },
    {
        id: "mojeid",
        title: "MojeID",
        description:
            "Využijte svou státem garantovanou identitu MojeID pro rychlé a spolehlivé ověření věku.",
    },
    {
        id: "ocr",
        title: "Sken dokladu",
        description:
            "Naskenujte svůj občanský průkaz nebo cestovní pas. Podporujeme všechny typy oficiálních dokladů.",
    },
]

export default function VerifyPage() {
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const { id } = useParams();
    const searchParams = useSearchParams();
    const apiKey = searchParams.get('apiKey');
     const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
             if (id) {
                const docRef = doc(db, "qrVerifications", id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setStatus(docSnap.data().status);
                } else {
                     toast({
                        variant: "destructive",
                        title: "Chyba",
                        description: "Neplatný odkaz pro ověření.",
                    });
                    router.push("/")
                }
            }
            setLoading(false);
        };
        fetchStatus();
    }, [id, router, toast]);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
  }

    const handleBack = () => {
        setSelectedMethod(null)
    }

  const renderSelectedMethod = () => {
        switch (selectedMethod) {
          case 'facescan':
            return <FaceScanStep onBack={handleBack} apiKey={apiKey} />
          case 'bankid':
            return <BankIDStep onBack={handleBack} apiKey={apiKey}/>
          case 'mojeid':
            return <MojeIDStep onBack={handleBack} apiKey={apiKey} />
          case 'ocr':
            return <IDScanStep onBack={handleBack} apiKey={apiKey}/>
          default:
            return null
        }
  }

     if (loading) {
        return <div>Načítání...</div>
    }
    if (status === "completed" || status === "rejected" || status === "failed") {
        return (
            <div className="min-h-screen bg-primary-light/10">
                <div className="container px-4 py-12 mx-auto">
                    <Card className="bg-white shadow-lg">
                        <CardContent className="p-6">
                            <h2 className="text-2xl font-bold text-primary mb-4">Ověření dokončeno</h2>
                            <p className="text-gray-light mb-6">
                                Vaše ověření bylo dokončeno.
                            </p>
                            <Button onClick={() => router.push("/")}>Zpět na e-shop</Button>
                            
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

  return (
    <div className="min-h-screen bg-primary-light/10">
      <div className="container px-4 py-12 mx-auto">
        {selectedMethod ? (
          renderSelectedMethod()
        ) : (
          <div className="space-y-6 bg-primary text-white p-8 rounded-lg shadow-lg">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Ověření věku
                <br />
                jednoduše a bezpečně
              </h1>
              <p className="text-lg opacity-90">
                Vyberte si z několika způsobů ověření věku. Všechny metody jsou plně
                automatizované, bezpečné a šifrované. Proces zabere jen pár minut.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {verificationMethods.map((method) => (
                <Card
                  key={method.id}
                  className="group relative overflow-hidden transition-all hover:shadow-md border-primary-light"
                >
                  <CardContent className="p-6">
                    <h2 className="font-semibold mb-2 text-primary text-xl">{method.title}</h2>
                    <p className="text-sm text-gray-light mb-4">
                      {method.description}
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal text-primary hover:text-primary-light"
                      onClick={() => handleMethodSelect(method.id)}
                    >
                      Vybrat metodu →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}