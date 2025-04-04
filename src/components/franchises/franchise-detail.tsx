import { FranchiseHeader } from "./franchise-detail/franchise-header";
// import { FranchiseInfo } from "./franchise-detail/franchise-info";
import { PaymentsHistory } from "./franchise-detail/payments-history";
import { LocationAndAgents } from "./franchise-detail/location-agents";
import { TrainingHistory } from "./franchise-detail/training-history";
import { AssistanceHistory } from "./franchise-detail/assistance-history";
import { supabase } from "@/lib/auth";
import { useEffect, useState } from "react";
import { ContractsHistory } from "./franchise-detail/contracts-history";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import VisitActionPlans from "../support/visit-action-plans";

// Skeleton loading components
const SkeletonHeader = () => (
  <Card>
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-24 w-48" />
        <Skeleton className="h-24 w-48" />
        <Skeleton className="h-24 w-48" />
      </div>
    </CardContent>
  </Card>
);

const SkeletonSection = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </CardContent>
  </Card>
);

export function FranchiseDetail({ franchise: initialFranchise, loadFranchises, onDelete, onUpdate,onVisitSelect }: any) {
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
  
  // Skeleton loading state
  if (loading) {
    return (
      <div className="container mx-auto space-y-6 animate-in fade-in-50">
        <SkeletonHeader />
        <SkeletonSection title="Payment History" />
        <SkeletonSection title="Contracts History" />
        <SkeletonSection title="Location & Agents" />
        <SkeletonSection title="Training History" />
        <SkeletonSection title="Assistance History" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto space-y-6 animate-in fade-in-50">
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
      <TrainingHistory franchise={franchise} />
      <AssistanceHistory franchise={franchise} onVisitSelect={onVisitSelect}/>
      <VisitActionPlans franchiseId={franchise.id}/>
    </div>
  );
}