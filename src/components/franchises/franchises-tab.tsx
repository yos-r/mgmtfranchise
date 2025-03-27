import { FileText, LayoutGrid, MapIcon, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FranchiseCard } from "./franchise-card";
import { FranchiseMap } from "./franchise-map";
import { FranchiseTable } from "./franchise-table";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { AddFranchise } from "./add-franchise";
import { FranchiseDetail } from "./franchise-detail";
interface FranchisesTabsProps {
    viewMode: string;
    setViewMode: React.Dispatch<React.SetStateAction<"list" | "grid" | "map">>;

}
export function FranchisesTab({ viewMode, setViewMode }: FranchisesTabsProps) {
    const [franchises, setFranchises] = useState<any[]>([]);
    const [isAddingFranchise, setIsAddingFranchise] = useState(false);
    const [selectedFranchise, setSelectedFranchise] = useState<any | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const handleFranchiseUpdated = () => {
        // Refresh the contracts list
        setRefreshKey(prev => prev + 1);
      };
    const loadFranchises = async () => {
        const { data, error } = await supabase
            .from('franchises')
            .select('*,franchise_contracts(*)')

            .order('name', { ascending: true })
            ;

        if (!error && data) {
            setFranchises(data);
            // setFranchises(data.map(f => ({ ...f }))); 

        }

    };

    useEffect(() => {
        loadFranchises();
        const channel = supabase
        .channel('franchise_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'franchises' }, () => {
            console.log("Franchises  updated, reloading...");
            loadFranchises();
        })
        .subscribe();
        const channel2 = supabase
        .channel('franchise_contracts_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'franchise_contracts' }, () => {
            console.log("Franchises contracts  updated, reloading...");
            loadFranchises();
        })
        .subscribe();


    return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(channel2);
    };
    

    }, []);
    if (isAddingFranchise) {
        return (
            <AddFranchise  onCancel={() => setIsAddingFranchise(false)} />
        )
    }
    if (selectedFranchise) {
        return (
        <FranchiseDetail loadFranchises={loadFranchises} franchise={selectedFranchise} onDelete={() => setIsAddingFranchise(false)} onUpdate={handleFranchiseUpdated}/>
        );
    }
    return (
        <div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="tagline-2">Franchise Network</CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center rounded-lg border p-1">
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="button-2"
                                    onClick={() => setViewMode('list')}
                                >
                                    <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="button-2"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                {/* <Button
                                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="button-2"
                                    onClick={() => setViewMode('map')}
                                >
                                    <MapIcon className="h-4 w-4" />
                                </Button> */}
                            </div>
                            <Button className="button-1" onClick={() => setIsAddingFranchise(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('addFranchise')}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {viewMode === 'map' ? (
                        <FranchiseMap franchises={franchises} onSelect={setSelectedFranchise} />
                    ) : viewMode === 'grid' ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {franchises.map((franchise) => (
                                <FranchiseCard
                                    key={franchise.id}
                                    franchise={franchise}
                                    onSelect={setSelectedFranchise}
                                />
                            ))}
                        </div>
                    ) : (
                        <FranchiseTable franchises={franchises} onFranchiseSelect={setSelectedFranchise} />
                    )}
                </CardContent>
            </Card>
        </div>

    )
}