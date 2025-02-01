"use client"

import {useToast } from '@/hooks/use-toast'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
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

export function TransactionHistory() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historie transakcí</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Částka</TableHead>
              <TableHead>Zůstatek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                  <TableCell>{transaction.createdAt?.toDate().toLocaleString()}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>{transaction.amount} Kč</TableCell>
                <TableCell>N/A Kč</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}