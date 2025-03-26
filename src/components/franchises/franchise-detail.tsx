
import { FranchiseHeader } from "./franchise-detail/franchise-header";
import { FranchiseInfo } from "./franchise-detail/franchise-info";
import { PaymentsHistory } from "./franchise-detail/payments-history";
import { LocationAndAgents } from "./franchise-detail/location-agents";
import { TrainingHistory } from "./franchise-detail/training-history";
import { AssistanceHistory } from "./franchise-detail/assistance-history";
import { supabase } from "@/lib/auth";
import { useEffect, useState } from "react";

export function FranchiseDetail({ franchise, loadFranchises }: any) {
  const [contracts, setContracts] = useState<any[]>([]);
  const loadContracts = async () => {
    const { data, error } = await supabase
      .from('franchise_contracts')
      .select('*')
      .eq('franchise_id', franchise.id)
      .order('start_date', { ascending: true })
      ;

    if (!error && data) {
      setContracts(data);

    }

  };

  useEffect(() => {
    loadContracts();
    const channel = supabase
      .channel('franchise_contracts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'franchise_contracts' }, () => {
        console.log("Franchise contracts  updated, reloading...");
        loadContracts();
      }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  return (
    <div className="container mx-auto space-y-6">

      <FranchiseHeader franchise={franchise} />
      <FranchiseInfo franchise={franchise} contracts={contracts} />
      <PaymentsHistory franchise={franchise} />
      <LocationAndAgents franchise={franchise} />
      <TrainingHistory />
      <AssistanceHistory />
    </div>
  );
}