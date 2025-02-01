"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

interface Transaction {
    id: string;
    createdAt: any;
    type: "credit" | "debit";
    amount: number;
    companyId: string;
    status: "pending" | "completed" | "failed";
    details: any;
}

export function InvoiceList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { user } = useAuth();
  const { toast } = useToast();

    useEffect(() => {
        const fetchTransactions = async () => {
            if (user?.uid) {
                try {
                    const token = await user.getIdToken();
                    const response = await fetch('/api/getTransactionHistory', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ data: { companyId: user.uid } })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setTransactions(data.data);
                    } else {
                        const errorData = await response.json();
                        toast({
                            variant: "destructive",
                            title: "Chyba",
                            description: `Nepodařilo se načíst historii transakcí: ${errorData.error}`,
                        });
                    }
                } catch (error: any) {
                    toast({
                        variant: "destructive",
                        title: "Chyba",
                        description: `Nepodařilo se načíst historii transakcí: ${error.message}`,
                    });
                }
            }
        };
        fetchTransactions();
    }, [user]);

  const handleDownload = (transaction: Transaction) => {
    // Zde by normálně bylo volání API pro stažení faktury
    console.log("Stahování faktury:", transaction.id)
    toast({
      title: "Faktura stažena",
      description: `Faktura ${transaction.id} byla úspěšně stažena.`,
    })
    // Simulace stahování
    const link = document.createElement('a')
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent('Obsah faktury ' + transaction.id)}`
        link.download = `faktura-${transaction.id}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Seznam faktur</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Číslo faktury</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Částka</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead>Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.id}</TableCell>
                <TableCell>{transaction.createdAt?.toDate().toLocaleString()}</TableCell>
                <TableCell>{transaction.amount} Kč</TableCell>
                <TableCell>{transaction.status}</TableCell>
                <TableCell>
                  <Button onClick={() => handleDownload(transaction)}>
                    Stáhnout
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}