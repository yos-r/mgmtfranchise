import { FileText, LayoutGrid, MapIcon, Plus, Building2, AlertCircle, Map, Filter, Search, X, Euro, Calendar, AlertTriangle, TrendingUp, Network, Hourglass, Sparkle, CrossIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FranchiseCard } from "./franchise-card";
import { FranchiseMap } from "./franchise-map";
import { FranchiseTable } from "./franchise-table";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { AddFranchise } from "./add-franchise";
import { FranchiseDetail } from "./franchise-detail";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { ExitIcon } from "@radix-ui/react-icons";

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

    // Calculate franchise statistics
    const stats = useMemo(() => {
        const currentDate = new Date();
        
        // Calculate new franchises (last 60 days)
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(currentDate.getDate() - 60);
        
        const newFranchises = franchises.filter(franchise => {
            // Check franchise creation date
            if (franchise.created_at && new Date(franchise.created_at) >= sixtyDaysAgo) {
                return true;
            }
            
            // Check first contract start date
            const contracts = franchise.franchise_contracts || [];
            if (contracts.length > 0) {
                const sortedContracts = [...contracts].sort(
                    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
                );
                
                return new Date(sortedContracts[0].start_date) >= sixtyDaysAgo;
            }
            
            return false;
        }).length;
        
        // Calculate expiring soon franchises (within 6 months)
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setDate(currentDate.getDate() + 180);
        
        const expiringSoon = franchises.filter(franchise => {
            const contracts = franchise.franchise_contracts || [];
            
            // Filter to non-terminated contracts
            const activeContracts = contracts.filter(contract => 
                contract.status !== 'terminated' && contract.terminated !== 'yes' && contract.terminated !== true
            );
            
            if (activeContracts.length === 0) return false;
            
            // Check if any contract expires within the next 6 months
            return activeContracts.some(contract => {
                // If expiration_date is directly available
                if (contract.expiration_date) {
                    const expirationDate = new Date(contract.expiration_date);
                    return expirationDate <= sixMonthsFromNow && expirationDate >= currentDate;
                }
                
                // Calculate expiration date from start_date + duration_years
                if (contract.start_date && contract.duration_years) {
                    const startDate = new Date(contract.start_date);
                    const expirationDate = new Date(startDate);
                    expirationDate.setFullYear(expirationDate.getFullYear() + contract.duration_years);
                    
                    return expirationDate <= sixMonthsFromNow && expirationDate >= currentDate;
                }
                
                return false;
            });
        }).length;
        
        // Calculate terminated franchises
        const terminated = franchises.filter(franchise => {
            // If franchise status is directly marked as terminated
            if (franchise.status === 'terminated') return true;
            
            // Check if all contracts are terminated
            const contracts = franchise.franchise_contracts || [];
            if (contracts.length === 0) return false;
            
            return contracts.every(contract => 
                contract.status === 'terminated' || 
                contract.terminated === 'yes' || 
                contract.terminated === true
            );
        }).length;
        
        return {
            total: franchises.length,
            new: newFranchises,
            expiring: expiringSoon,
            terminated: terminated
        };
    }, [franchises]);

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
            thirtyDaysAgo.setDate(currentDate.getDate() - 60);
            const isNew = new Date(latestContract?.start_date) >= thirtyDaysAgo; //creation date

            const isTerminated = franchise.franchise_contracts?.every(
                (contract: any) => contract.status === 'terminated'
            ) || franchise.status == 'terminated' || false;

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
            <div className="mb-6">
                <h2 className="tagline-1">Franchises</h2>
                <p className="body-lead text-muted-foreground">
                    Manage and track franchises
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="tagline-3">Total Franchises</CardTitle>
                      <Network className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="numbers text-2xl font-bold">
                        {stats.total}
                      </div>
                      <p className="legal text-muted-foreground">
                        Network franchises 
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="tagline-3">New Franchises</CardTitle>
                      <Sparkle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="numbers text-2xl font-bold">{stats.new}</div>
                      <p className="legal text-muted-foreground">
                        From the last 60 days
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="tagline-3">Expiring Soon</CardTitle>
                      <Hourglass className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="numbers text-2xl font-bold">{stats.expiring}</div>
                      <p className="legal text-muted-foreground">
                        Expiring in 6 months
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="tagline-3">Terminated Franchises</CardTitle>
                      <ExitIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="numbers text-2xl font-bold">{stats.terminated}</div>
                      <p className="legal text-muted-foreground">
                        Franchises with terminated contracts
                      </p>
                    </CardContent>
                  </Card>
                </div>
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
                                        Expiring Soon (180 Days)
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={activeFilters.includes("newFranchises")}
                                        onCheckedChange={() => toggleFilter("newFranchises")}
                                    >
                                        New Franchises (60 Days)
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