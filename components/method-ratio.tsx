"use client"

import {useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { db } from "@/lib/firebase";
import { collection, query, getDocs, Timestamp, where } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface MethodStats {
    name: string;
    value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function MethodRatio() {
    const [methodStats, setMethodStats] = useState<MethodStats[]>([]);
    const { user } = useAuth();
  const { toast } = useToast();

    useEffect(() => {
        const fetchMethodStats = async () => {
            if (user?.uid) {
                try {
                    const today = new Date();
                    const token = await user.getIdToken();
                    const response = await fetch('/api/getMethodRatio', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ data: { companyId: user.uid, date: today.toISOString() } })
                    });
                    if (response.ok) {
                       const data = await response.json();
                        setMethodStats(data.data);
                    } else {
                        const errorData = await response.json();
                        toast({
                            variant: "destructive",
                            title: "Chyba",
                            description: `Nepodařilo se načíst poměr metod: ${errorData.error}`,
                        });
                    }
                } catch (error: any) {
                    toast({
                        variant: "destructive",
                        title: "Chyba",
                        description: `Nepodařilo se načíst poměr metod: ${error.message}`,
                    });
                }
            }
        };
        fetchMethodStats();
    }, [user]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Poměr metod</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={methodStats}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {methodStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} verifikací`}/>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {methodStats.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center">
              <div className="w-3 h-3 mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span>{entry.name}: {entry.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}