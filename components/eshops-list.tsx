"use client"

import {useToast } from '@/hooks/use-toast'
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { db } from "@/lib/firebase";
import { collection, query, getDocs, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

// Define the type for the Eshop object
type Eshop = {
  id: string
  name: string
  website: string
  platform: string
  apiKey: string
  methods: string[]
  category: string
  categories: { id: string; name: string; requiresVerification: boolean }[]
}

interface EshopsListProps {
  eshops: any[];
  className?: string;
}


export function EshopsList({ className, eshops: initialEshops }: EshopsListProps) {
  const [eshops, setEshops] = useState<Eshop[]>([]);
  const [selectedEshop, setSelectedEshop] = useState<Eshop | null>(null)
    const { user } = useAuth();
  const { toast } = useToast();

    useEffect(() => {
        const fetchEshops = async () => {
            if(user?.uid) {
                try {
                    const token = await user.getIdToken();
                    const response = await fetch('/api/getEshops', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ data: { companyId: user.uid } })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setEshops(data.data.map((eshop: any) => ({
                            ...eshop,
                            categories: [
                                { id: "1", name: "Hry pro dospělé", requiresVerification: true },
                                { id: "2", name: "Zboží", requiresVerification: false },
                                { id: "3", name: "Produkty pro dospělé", requiresVerification: true },
                                { id: "4", name: "Vzdělávací materiály", requiresVerification: false },
                                { id: "5", name: "Střelné zbraně", requiresVerification: true },
                                { id: "6", name: "Příslušenství", requiresVerification: false },
                              ]
                        })));
                    } else {
                        const errorData = await response.json();
                        toast({
                            variant: "destructive",
                            title: "Chyba",
                            description: `Nepodařilo se načíst e-shopy: ${errorData.error}`,
                        });
                    }
                } catch (error: any) {
                    toast({
                        variant: "destructive",
                        title: "Chyba",
                        description: `Nepodařilo se načíst e-shopy: ${error.message}`,
                    });
                }
            }

        };
        fetchEshops();
    }, [user]);

  const handleCategoryToggle = async (eshopId: string, categoryId: string) => {
      setEshops(eshops.map(eshop => {
          if (eshop.id === eshopId) {
              return {
                  ...eshop,
                  categories: eshop.categories.map(category =>
                      category.id === categoryId
                          ? { ...category, requiresVerification: !category.requiresVerification }
                          : category
                  )
              }
          }
          return eshop
      }))
      try {
         const eshopRef = doc(db, "eshops", eshopId);
        await updateDoc(eshopRef, {
            categories: eshops.find(eshop => eshop.id === eshopId)?.categories
        })
      } catch (error) {
           console.error("Failed to update categories", error)
      }
  }

  const openDialog = (eshop: Eshop) => {
    setSelectedEshop(eshop)
  }

  const closeDialog = () => {
    setSelectedEshop(null)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Vaše E-shopy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table className="w-full overflow-x-auto">
            <TableHeader>
              <TableRow>
                <TableHead>Název</TableHead>
                <TableHead>Web</TableHead>
                <TableHead>Platforma</TableHead>
                <TableHead>API Klíč</TableHead>
                <TableHead>Metody</TableHead>
                  <TableHead>Kategorie</TableHead>
                <TableHead>Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eshops.map((eshop) => (
                <TableRow key={eshop.id}>
                  <TableCell className="font-medium">{eshop.name}</TableCell>
                  <TableCell>{eshop.website}</TableCell>
                  <TableCell>{eshop.platform}</TableCell>
                  <TableCell>{eshop.apiKey}</TableCell>
                  <TableCell>
                    {eshop.methods.map((method, i) => (
                      <Badge key={i} variant="secondary" className="mr-1">
                        {method}
                      </Badge>
                    ))}
                  </TableCell>
                    <TableCell>{eshop.category}</TableCell>
                  <TableCell>
                    <Dialog open={selectedEshop?.id === eshop.id} onOpenChange={closeDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => openDialog(eshop)}>
                          Spravovat kategorie
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Spravovat kategorie pro {eshop.name}</DialogTitle>
                          <DialogDescription>
                            Vyberte, které kategorie vyžadují ověření věku.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          {eshop.categories.map((category) => (
                            <div key={category.id} className="flex items-center space-x-2 mb-2">
                              <Checkbox
                                id={`category-${category.id}`}
                                checked={category.requiresVerification}
                                onCheckedChange={() => handleCategoryToggle(eshop.id, category.id)}
                              />
                              <label htmlFor={`category-${category.id}`}>
                                {category.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <DialogFooter>
                          <Button onClick={closeDialog}>Uložit změny</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}