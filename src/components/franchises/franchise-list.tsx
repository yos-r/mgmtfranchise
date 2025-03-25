import { FileText, LayoutGrid, MapIcon, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FranchiseCard } from "./franchise-card";
import { FranchiseMap } from "./franchise-map";
import { FranchiseTable } from "./franchise-table";

interface FranchiseListProps {
  franchises: any[];
  viewMode: 'list' | 'grid' | 'map';
  onViewModeChange: (mode: 'list' | 'grid' | 'map') => void;
  onFranchiseSelect: (id: number) => void;
  onAddFranchise: () => void;
}

export function FranchiseList({
  franchises,
  viewMode,
  onViewModeChange,
  onFranchiseSelect,
  onAddFranchise,
}: FranchiseListProps) {
  return (
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
                onClick={() => onViewModeChange('list')}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="button-2"
                onClick={() => onViewModeChange('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                className="button-2"
                onClick={() => onViewModeChange('map')}
              >
                <MapIcon className="h-4 w-4" />
              </Button>
            </div>
            <Button className="button-1" onClick={onAddFranchise}>
              <Plus className="mr-2 h-4 w-4" />
              New Franchise
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'map' ? (
          <FranchiseMap franchises={franchises} onSelect={onFranchiseSelect} />
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {franchises.map((franchise) => (
              <FranchiseCard
                key={franchise.id}
                franchise={franchise}
                onSelect={onFranchiseSelect}
              />
            ))}
          </div>
        ) : (
          <FranchiseTable
            franchises={franchises}
            onFranchiseSelect={onFranchiseSelect}
          />
        )}
      </CardContent>
    </Card>
  );
}