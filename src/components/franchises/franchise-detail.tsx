import { FranchiseHeader } from "./franchise-detail/franchise-header";
import { FranchiseInfo } from "./franchise-detail/franchise-info";
import { PaymentsHistory } from "./franchise-detail/payments-history";
import { LocationAndAgents } from "./franchise-detail/location-agents";
import { TrainingHistory } from "./franchise-detail/training-history";
import { AssistanceHistory } from "./franchise-detail/assistance-history";
import { supabase } from "@/lib/auth";
import { useEffect, useState } from "react";
import { ContractsHistory } from "./franchise-detail/contracts-history";

export function FranchiseDetail({ franchise: initialFranchise, loadFranchises, onDelete, onUpdate }: any) {
  // Keep local state of franchise data to allow immediate updates
  const [franchise, setFranchise] = useState(initialFranchise);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Update local franchise state when prop changes
  useEffect(() => {
    setFranchise(initialFranchise);
  }, [initialFranchise]);
  const handleDelete = () => {
    // Call the onDelete function passed from the parent to navigate back
    if (onDelete) {
      onDelete();
    }
  };
  const loadContracts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('franchise_contracts')
      .select('*')
      .eq('franchise_id', franchise.id)
      .order('start_date', { ascending: true });
    
    if (!error && data) {
      setContracts(data);
    } else if (error) {
      console.error("Error loading contracts:", error);
    }
    
    setLoading(false);
  };
  
  useEffect(() => {
    loadContracts();
    
    const channel = supabase
      .channel('franchise_contracts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'franchise_contracts' }, () => {
        console.log("Franchise contracts updated, reloading...");
        loadContracts();
      }).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    }
  }, [franchise.id]);
  
  const activeContract = contracts.length > 0 ? contracts[contracts.length - 1] : undefined;
  
  // Handler for franchise updates - update local state immediately
  const handleFranchiseUpdate = (updatedFranchise) => {
    // Update the local franchise state
    setFranchise(prev => ({
      ...prev,
      ...updatedFranchise
    }));
    
    // Also call the parent's onUpdate if available
    if (onUpdate) {
      onUpdate();
    }
  };
  
  return (
    <div className="container mx-auto space-y-6">
      {loading ? (
        <div className="p-6 text-center">Loading contract details...</div>
      ) : (
        <>
          <FranchiseHeader 
            franchise={franchise} 
            contract={activeContract} 
            onDelete={handleDelete} // Pass our local handler
            onUpdate={handleFranchiseUpdate}
          />
          {/* <FranchiseInfo franchise={franchise} contracts={contracts} /> */}
          <PaymentsHistory franchise={franchise} />
          <ContractsHistory contracts={contracts} franchise_id={franchise.id} />
          <LocationAndAgents franchise={franchise} />
          
          <TrainingHistory />
          <AssistanceHistory />
        </>
      )}
    </div>
  );
}