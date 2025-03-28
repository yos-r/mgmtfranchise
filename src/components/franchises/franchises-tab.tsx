import { FileText, LayoutGrid, MapIcon, Plus, Building2, AlertCircle, Map, Filter, Search, X } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";

interface FranchisesTabsProps {
    viewMode: string;
    setViewMode: React.Dispatch<React.SetStateAction<"list" | "grid" | "map">>;
}

// Define filter types
type FilterOption = "expiringFranchises" | "newFranchises" | "terminatedFranchises";

export function FranchisesTab({ viewMode, setViewMode }: FranchisesTabsProps) {
    const [franchises, setFranchises] = useState<any[]>([]);
    const [filteredFranchises, setFilteredFranchises] = useState<any[]>([]);
    const [isAddingFranchise, setIsAddingFranchise] = useState(false);
    const [selectedFranchise, setSelectedFranchise] = useState<any | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    
    const handleFranchiseUpdated = () => {
        // Refresh the contracts list
        setRefreshKey(prev => prev + 1);
    };

    // Apply filters and search to the franchises
    const applyFiltersAndSearch = (franchisesData: any[]) => {
        // First apply search
        let result = franchisesData;
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(franchise => 
                (franchise.name && franchise.name.toLowerCase().includes(query)) ||
                (franchise.address && franchise.address.toLowerCase().includes(query)) ||
                (franchise.city && franchise.city.toLowerCase().includes(query)) ||
                (franchise.country && franchise.country.toLowerCase().includes(query))
            );
        }
        
        // Then apply filters if any
        if (activeFilters.length === 0) {
            return result;
        }

        return result.filter(franchise => {
            const currentDate = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(currentDate.getDate() + 180);
            
            const activeContracts = franchise.franchise_contracts?.filter(
                (contract: any) => contract.status !== 'terminated'
            ) || [];
            
            const latestContract = activeContracts.length > 0 
                ? activeContracts.sort((a: any, b: any) => 
                    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
                )[0] 
                : null;
                
            const isExpiring = latestContract && 
                latestContract.expiration_date && 
                new Date(latestContract.expiration_date) <= thirtyDaysFromNow &&
                new Date(latestContract.expiration_date) >= currentDate;
                
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(currentDate.getDate() - 180);
            const isNew = new Date(latestContract?.start_date) >= thirtyDaysAgo; //creation date
            
            const isTerminated = franchise.franchise_contracts?.every(
                (contract: any) => contract.status === 'terminated'
            ) || franchise.status=='terminated' || false;
            
            return (
                (activeFilters.includes("expiringFranchises") && isExpiring) ||
                (activeFilters.includes("newFranchises") && isNew) ||
                (activeFilters.includes("terminatedFranchises") && isTerminated)
            );
        });
    };
    
    const loadFranchises = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('franchises')
                .select('*,franchise_contracts(*)')
                .order('name', { ascending: true });

            if (!error && data) {
                setFranchises(data);
                setFilteredFranchises(applyFiltersAndSearch(data));
            } else if (error) {
                console.error("Error loading franchises:", error);
            }
        } catch (err) {
            console.error("Exception loading franchises:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFranchises();
        
        const channel = supabase
            .channel('franchise_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'franchises' }, () => {
                console.log("Franchises updated, reloading...");
                loadFranchises();
            })
            .subscribe();
            
        const channel2 = supabase
            .channel('franchise_contracts_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'franchise_contracts' }, () => {
                console.log("Franchises contracts updated, reloading...");
                loadFranchises();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(channel2);
        };
    }, [refreshKey]);
    
    // Apply filters and search when they change
    useEffect(() => {
        setFilteredFranchises(applyFiltersAndSearch(franchises));
    }, [activeFilters, franchises, searchQuery]);
    
    // Toggle filter
    const toggleFilter = (filter: FilterOption) => {
        setActiveFilters(prev => 
            prev.includes(filter) 
                ? prev.filter(f => f !== filter) 
                : [...prev, filter]
        );
    };
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };
    
    const clearSearch = () => {
        setSearchQuery("");
    };
    
    if (isAddingFranchise) {
        return (
            <AddFranchise onCancel={() => setIsAddingFranchise(false)} />
        )
    }
    
    if (selectedFranchise) {
        return (
            <FranchiseDetail
                loadFranchises={loadFranchises}
                franchise={selectedFranchise}
                onDelete={() => setSelectedFranchise(null)} 
                onUpdate={handleFranchiseUpdated}
            />
        );
    }
    
    // Empty state component
    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
                <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Franchises Found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
                {activeFilters.length > 0 || searchQuery
                    ? "No franchises match the current filters or search terms. Try adjusting your criteria."
                    : "There are no franchises in your network yet. Add your first franchise to get started."}
            </p>
            <div className="flex gap-3">
                {(activeFilters.length > 0 || searchQuery) && (
                    <Button variant="outline" onClick={() => {
                        setActiveFilters([]);
                        setSearchQuery("");
                    }}>
                        Clear All
                    </Button>
                )}
                <Button onClick={() => setIsAddingFranchise(true)} className="button-1">
                    <Plus className="mr-2 h-4 w-4" />
                    {activeFilters.length > 0 || searchQuery ? "Add New Franchise" : "Add Your First Franchise"}
                </Button>
            </div>
        </div>
    );
    
    // Loading state component
    const LoadingState = () => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="animate-pulse rounded-full bg-muted p-6 mb-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Loading Franchises</h3>
            <p className="text-muted-foreground max-w-md">
                Please wait while we load your franchise network...
            </p>
        </div>
    );

    return (
        <div>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="tagline-2">Franchise Network</CardTitle>
                        <div className="flex items-center gap-4">
                            {/* Search Bar */}
                            <div className="relative w-[250px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search franchises..."
                                    className="pl-8 pr-8"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                                {searchQuery && (
                                    <button 
                                        type="button" 
                                        onClick={clearSearch}
                                        className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            
                            {/* Filter Button */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Filter
                                        {activeFilters.length > 0 && (
                                            <Badge className="ml-1 h-5 px-1.5 bg-primary">{activeFilters.length}</Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuCheckboxItem
                                        checked={activeFilters.includes("expiringFranchises")}
                                        onCheckedChange={() => toggleFilter("expiringFranchises")}
                                    >
                                        Expiring Soon (30 Days)
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={activeFilters.includes("newFranchises")}
                                        onCheckedChange={() => toggleFilter("newFranchises")}
                                    >
                                        New Franchises (30 Days)
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={activeFilters.includes("terminatedFranchises")}
                                        onCheckedChange={() => toggleFilter("terminatedFranchises")}
                                    >
                                        Terminated Franchises
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            
                            {/* View Mode Toggle */}
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
                                <Button
                                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="button-2"
                                    onClick={() => setViewMode('map')}
                                >
                                    <Map className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            {/* Add Franchise Button */}
                            <Button className="button-1" onClick={() => setIsAddingFranchise(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('addFranchise')}
                            </Button>
                        </div>
                    </div>
                    {/* Active Filters and Search */}
                    {(activeFilters.length > 0 || searchQuery) && (
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-sm text-muted-foreground">Active criteria:</span>
                            {searchQuery && (
                                <Badge 
                                    variant="secondary"
                                    className="flex items-center gap-1 cursor-pointer"
                                    onClick={clearSearch}
                                >
                                    Search: {searchQuery}
                                    <span className="text-xs ml-1">×</span>
                                </Badge>
                            )}
                            {activeFilters.map(filter => (
                                <Badge 
                                    key={filter} 
                                    variant="secondary"
                                    className="flex items-center gap-1 cursor-pointer"
                                    onClick={() => toggleFilter(filter)}
                                >
                                    {filter === "expiringFranchises" && "Expiring Soon"}
                                    {filter === "newFranchises" && "New Franchises"}
                                    {filter === "terminatedFranchises" && "Terminated"}
                                    <span className="text-xs ml-1">×</span>
                                </Badge>
                            ))}
                            <Button 
                                variant="ghost" 
                                className="h-6 px-2 text-xs" 
                                onClick={() => {
                                    setActiveFilters([]);
                                    setSearchQuery("");
                                }}
                            >
                                Clear all
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <LoadingState />
                    ) : filteredFranchises.length === 0 ? (
                        <EmptyState />
                    ) : viewMode === 'map' ? (
                        <FranchiseMap franchises={filteredFranchises} onSelect={setSelectedFranchise} />
                    ) : viewMode === 'grid' ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredFranchises.map((franchise) => (
                                <FranchiseCard
                                    key={franchise.id}
                                    franchise={franchise}
                                    onSelect={setSelectedFranchise}
                                />
                            ))}
                        </div>
                    ) : (
                        <FranchiseTable franchises={filteredFranchises} onFranchiseSelect={setSelectedFranchise} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}