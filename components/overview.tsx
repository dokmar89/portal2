"use client"

import {useToast } from '@/hooks/use-toast'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { db } from "@/lib/firebase";
import { collection, query, getDocs, Timestamp, where, getCountFromServer } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface OverviewData {
  name: string;
  total: number;
}

export function Overview() {
    const [overviewData, setOverviewData] = useState<OverviewData[]>([]);
    const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOverviewData = async () => {
        if (user?.uid) {
            try {
                const today = new Date();
                const token = await user.getIdToken();
                const response = await fetch('/api/getOverviewData', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ data: { companyId: user.uid, month: today.toISOString() } })
                });
                if (response.ok) {
                    const data = await response.json();
                    setOverviewData(data.data);
                } else {
                    const errorData = await response.json();
                    toast({
                        variant: "destructive",
                        title: "Chyba",
                        description: `Nepodařilo se načíst data přehledu: ${errorData.error}`,
                    });
                }
            }
        };
        fetchOverviewData();
    }, [user]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={overviewData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
          <Tooltip formatter={(value) => `${value} verifikací`} />
          <Legend />
      </BarChart>
    </ResponsiveContainer>
  )
}