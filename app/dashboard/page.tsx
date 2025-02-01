"use client"
import { AddEshopDialog } from "@/components/add-eshop-dialog"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { MethodRatio } from "@/components/method-ratio"
import { SuccessRatio } from "@/components/success-ratio"
import { WalletBalance } from "@/components/wallet-balance"
import { EshopsList } from "@/components/eshops-list"
import { RecentActivity } from "@/components/recent-activity"
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, Timestamp, where, getCountFromServer } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
    const [verificationsCount, setVerificationsCount] = useState(0);
    const { user } = useAuth();
    const [eshops, setEshops] = useState<any[]>([]);
    useEffect(() => {

          const fetchCounts = async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const verificationsQuery = query(collection(db, "verifications"), where("createdAt", ">=", Timestamp.fromDate(today)), where("createdAt", "<", Timestamp.fromDate(tomorrow)));
            const verificationsSnapshot = await getCountFromServer(verificationsQuery);

            setVerificationsCount(verificationsSnapshot.data().count);
        }
       
      const fetchEshops = async () => {
            if (user?.uid) {
                const q = query(collection(db, "eshops"), where("companyId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const fetchedEshops = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEshops(fetchedEshops);
            }
        }
        fetchCounts();
        fetchEshops();
    }, [user]);
  return (
    <DashboardShell>
      <DashboardHeader heading="Nástěnka" text="Přehled vašeho PassProve účtu">
        <AddEshopDialog />
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MethodRatio />
          <SuccessRatio verificationsCount={verificationsCount}/>
        <WalletBalance />
      </div>
      <div className="mt-4">
        <EshopsList eshops={eshops} className="col-span-full" />
      </div>
      <RecentActivity className="col-span-full" />
    </DashboardShell>
  )
}