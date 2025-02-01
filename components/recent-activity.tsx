"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, limit, Timestamp, where } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

import {useToast } from '@/hooks/use-toast'

interface Verification {
  id: string;
  method: string;
  status: "success" | "failed";
  createdAt: any;
    eshopId: string
}

export function RecentActivity({ className }: { className?: string }) {
    const [activities, setActivities] = useState<Verification[]>([]);
    const { user } = useAuth();


  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (user?.uid) {
        const q = query(collection(db, "verifications"), where("eshopId", "==", user.uid), orderBy("createdAt", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        const fetchedActivities = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Verification[];
        setActivities(fetchedActivities);
      }
    };

    fetchRecentActivity();
  }, [user]);
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Nedávná aktivita</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.method} verifikace
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.createdAt?.toDate().toLocaleString()}
                </p>
              </div>
              <div className="ml-auto font-medium">
                {activity.status === "success" ? (
                  <span className="text-green-500">Úspěch</span>
                ) : (
                  <span className="text-red-500">Selhání</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}