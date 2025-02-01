"use client"

import {useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { db } from "@/lib/firebase";
import { collection, query, getDocs, Timestamp, where, getCountFromServer } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SuccessRatioProps {
    verificationsCount: number;
}

interface StatusStats {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export function SuccessRatio({verificationsCount}: SuccessRatioProps) {
    const [statusStats, setStatusStats] = useState<StatusStats[]>([])
    const { user } = useAuth();
  const { toast } = useToast();

    useEffect(() => {
        const fetchStatusStats = async () => {
            if (user?.uid) {
                try {
                    const today = new Date();
                    const token = await user.getIdToken();
                    const response = await fetch('/api/getSuccessRatio', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ data: { companyId: user.uid, date: today.toISOString() } })
                    });
                    if (response.ok) {
                       const data = await response.json();
                        setStatusStats(data.data);
                    } else {
                        const errorData = await response.json();
                        toast({
                            variant: "destructive",
                            title: "Chyba",
                            description: `Nepodařilo se načíst poměr úspěšnosti: ${errorData.error}`,
                        });
                    }
                } catch (error: any) {
                    toast({
                        variant: "destructive",
                        title: "Chyba",
                        description: `Nepodařilo se načíst poměr úspěšnosti: ${error.message}`,
                    });
                }
            }
        };
        fetchStatusStats();
    },[user, verificationsCount])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Poměr úspěšnosti</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `${value} verifikací`} />
            <Bar dataKey="value" fill="#8884d8">
              {statusStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
          <p>Počet ověření dnes: {verificationsCount}</p>
      </CardContent>
    </Card>
  )
}