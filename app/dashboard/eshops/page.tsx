'use client'

import { useEffect, useState } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { EshopsList } from "@/components/eshops-list";
import { AddEshopDialog } from "@/components/add-eshop-dialog";

export default function EshopsPage() {
  const [eshops, setEshops] = useState([]);
  const companyId = "exampleCompanyId"; // Replace with actual company ID

  useEffect(() => {
    const fetchEshops = async () => {
      try {
        const q = query(collection(db, "Eshops"), where("companyId", "==", companyId));
        const snapshot = await getDocs(q);
        setEshops(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching e-shops:", error);
      }
    };

    fetchEshops();
  }, [companyId]);

  return (
    <DashboardShell>
      <DashboardHeader heading="E-shopy" text="Správa vašich e-shopů">
        <AddEshopDialog />
      </DashboardHeader>
      <EshopsList data={eshops} />
    </DashboardShell>
  );
}