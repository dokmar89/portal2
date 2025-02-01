"use client"

import {useToast } from '@/hooks/use-toast'
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

interface Verification {
  id: string;
  method: string;
  createdAt: any;
  status: "success" | "failed";
  eshopId: string;
    userId: string;
}

export function VerificationHistory() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
    const { user } = useAuth();
  const { toast } = useToast();


  useEffect(() => {
    const fetchVerifications = async () => {
        if(user?.uid) {
            try {
                const token = await user.getIdToken();
                const response = await fetch('/api/getVerificationHistory', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ data: { companyId: user.uid } })
                });
                if (response.ok) {
                    const data = await response.json();
                    setVerifications(data.data);
                } else {
                    const errorData = await response.json();
                    toast({
                        variant: "destructive",
                        title: "Chyba",
                        description: `Nepodařilo se načíst historii ověření: ${errorData.error}`,
                    });
                }
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Chyba",
                    description: `Nepodařilo se načíst historii ověření: ${error.message}`,
                });
            }
        }
    };
    fetchVerifications();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historie ověření</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Metoda</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ID uživatele</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifications.map((verification) => (
              <TableRow key={verification.id}>
                <TableCell>{verification.createdAt?.toDate().toLocaleString()}</TableCell>
                <TableCell>{verification.method}</TableCell>
                <TableCell>{verification.status}</TableCell>
                <TableCell>{verification.userId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}