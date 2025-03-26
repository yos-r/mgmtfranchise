
import { FranchiseHeader } from "./franchise-detail/franchise-header";
import { FranchiseInfo } from "./franchise-detail/franchise-info";
import { PaymentsHistory } from "./franchise-detail/payments-history";
import { LocationAndAgents } from "./franchise-detail/location-agents";
import { TrainingHistory } from "./franchise-detail/training-history";
import { AssistanceHistory } from "./franchise-detail/assistance-history";
import { supabase } from "@/lib/auth";
import { useEffect, useState } from "react";

export function FranchiseDetail({ franchise }: any) {
  console.log("🚀 FranchiseDetail received:", franchise); // Log what franchise is

  return (
    <div className="container mx-auto space-y-6">
     
     <FranchiseHeader franchise={franchise} />
     <FranchiseInfo franchise={franchise} />
      <PaymentsHistory franchise={franchise}/>
      <LocationAndAgents franchise={franchise} />
      <TrainingHistory />
      <AssistanceHistory />
    </div>
  );
}