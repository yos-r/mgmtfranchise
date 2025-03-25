import { useState } from 'react';
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FranchiseHeader } from "./franchise-detail/franchise-header";
import { FranchiseInfo } from "./franchise-detail/franchise-info";
import { PaymentsHistory } from "./franchise-detail/payments-history";
import { LocationAndAgents } from "./franchise-detail/location-agents";
import { TrainingHistory } from "./franchise-detail/training-history";
import { AssistanceHistory } from "./franchise-detail/assistance-history";

export function FranchiseDetail() {
  return (
    <div className="container mx-auto space-y-6">
     

      <FranchiseHeader />
      <FranchiseInfo />
      <PaymentsHistory />
      <LocationAndAgents />
      <TrainingHistory />
      <AssistanceHistory />
    </div>
  );
}