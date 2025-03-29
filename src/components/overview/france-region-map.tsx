import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const FranceRegionsMap = () => {
  // Generate performance data for regions
  const [regionsData] = useState(() => {
    const regions = [
      { id: "ile-de-france", name: "Paris", value: Math.floor(Math.random() * 900000 + 500000) },
      { id: "auvergne-rhone-alpes", name: "Lyon", value: Math.floor(Math.random() * 800000 + 400000) },
      { id: "provence-alpes-cote-d-azur", name: "Marseille", value: Math.floor(Math.random() * 700000 + 350000) },
      { id: "nouvelle-aquitaine", name: "Bordeaux", value: Math.floor(Math.random() * 650000 + 300000) },
      { id: "occitanie", name: "Toulouse", value: Math.floor(Math.random() * 600000 + 250000) },
      { id: "hauts-de-france", name: "Lille", value: Math.floor(Math.random() * 550000 + 200000) },
      { id: "grand-est", name: "Strasbourg", value: Math.floor(Math.random() * 500000 + 180000) },
      { id: "pays-de-la-loire", name: "Nantes", value: Math.floor(Math.random() * 450000 + 150000) },
      { id: "bretagne", name: "Rennes", value: Math.floor(Math.random() * 400000 + 120000) },
      { id: "normandie", name: "Rouen", value: Math.floor(Math.random() * 350000 + 100000) },
      { id: "bourgogne-franche-comte", name: "Dijon", value: Math.floor(Math.random() * 300000 + 90000) },
      { id: "centre-val-de-loire", name: "Orléans", value: Math.floor(Math.random() * 250000 + 80000) },
      { id: "corse", name: "Corsica", value: Math.floor(Math.random() * 200000 + 70000) }
    ];
    
    // Sort by value for the legend display
    return regions.sort((a, b) => b.value - a.value);
  });

  // Get color based on value (higher value = darker blue)
  const getColor = (value) => {
    const maxValue = Math.max(...regionsData.map(r => r.value));
    const minValue = Math.min(...regionsData.map(r => r.value));
    
    // Calculate percentage (0-100)
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    
    // Map to color intensity (lighter to darker blue)
    if (percentage > 80) return "fill-blue-800";
    if (percentage > 60) return "fill-blue-700"; 
    if (percentage > 40) return "fill-blue-600";
    if (percentage > 20) return "fill-blue-500";
    return "fill-blue-400";
  };

  // Track hovered region for tooltip
  const [hoveredRegion, setHoveredRegion] = useState(null);

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="tagline-2">Top Performing Regions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* France SVG Map */}
          <div className="relative flex-grow">
            <svg
              viewBox="0 0 600 600"
              className="w-full h-auto"
            >
              {/* Background shape for France */}
              <path
                d="M260,90 L220,120 L240,180 L210,210 L170,200 L145,230 L130,300 L150,370 L120,420 L150,460 L220,470 L300,520 L380,490 L450,430 L470,350 L450,280 L480,230 L450,180 L390,150 L360,90 L310,70 L260,90"
                className="fill-gray-100 stroke-gray-300"
                strokeWidth="2"
              />
              
              {/* Region shapes - simplified for demonstration */}
              <path
                id="ile-de-france"
                d="M305,240 L290,260 L310,280 L330,260 L305,240"
                className={`${getColor(regionsData.find(r => r.id === "ile-de-france")?.value)} cursor-pointer transition-colors hover:brightness-110 stroke-gray-300`}
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionsData.find(r => r.id === "ile-de-france"))}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <path
                id="auvergne-rhone-alpes"
                d="M360,320 L330,350 L350,380 L390,370 L420,340 L400,310 L360,320"
                className={`${getColor(regionsData.find(r => r.id === "auvergne-rhone-alpes")?.value)} cursor-pointer transition-colors hover:brightness-110 stroke-gray-300`}
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionsData.find(r => r.id === "auvergne-rhone-alpes"))}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <path
                id="provence-alpes-cote-d-azur"
                d="M380,400 L410,380 L450,400 L430,430 L380,430 L380,400"
                className={`${getColor(regionsData.find(r => r.id === "provence-alpes-cote-d-azur")?.value)} cursor-pointer transition-colors hover:brightness-110 stroke-gray-300`}
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionsData.find(r => r.id === "provence-alpes-cote-d-azur"))}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <path
                id="nouvelle-aquitaine"
                d="M210,350 L250,330 L280,360 L270,410 L230,420 L210,390 L210,350"
                className={`${getColor(regionsData.find(r => r.id === "nouvelle-aquitaine")?.value)} cursor-pointer transition-colors hover:brightness-110 stroke-gray-300`}
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionsData.find(r => r.id === "nouvelle-aquitaine"))}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <path
                id="occitanie"
                d="M300,400 L340,380 L370,410 L340,440 L300,430 L300,400"
                className={`${getColor(regionsData.find(r => r.id === "occitanie")?.value)} cursor-pointer transition-colors hover:brightness-110 stroke-gray-300`}
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionsData.find(r => r.id === "occitanie"))}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <path
                id="hauts-de-france"
                d="M290,150 L320,130 L350,150 L330,180 L290,170 L290,150"
                className={`${getColor(regionsData.find(r => r.id === "hauts-de-france")?.value)} cursor-pointer transition-colors hover:brightness-110 stroke-gray-300`}
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionsData.find(r => r.id === "hauts-de-france"))}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <path
                id="grand-est"
                d="M370,180 L410,170 L430,200 L410,230 L370,210 L370,180"
                className={`${getColor(regionsData.find(r => r.id === "grand-est")?.value)} cursor-pointer transition-colors hover:brightness-110 stroke-gray-300`}
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionsData.find(r => r.id === "grand-est"))}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <path
                id="pays-de-la-loire"
                d="M220,280 L260,260 L280,290 L260,320 L220,310 L220,280"
                className={`${getColor(regionsData.find(r => r.id === "pays-de-la-loire")?.value)} cursor-pointer transition-colors hover:brightness-110 stroke-gray-300`}
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionsData.find(r => r.id === "pays-de-la-loire"))}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <path
                id="bretagne"
                d="M150,250 L190,240 L210,260 L190,280 L150,270 L150,250"
                className={`${getColor(regionsData.find(r => r.id === "bretagne")?.value)} cursor-pointer transition-colors hover:brightness-110 stroke-gray-300`}
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionsData.find(r => r.id === "bretagne"))}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <path
                id="normandie"
                d="M230,200 L270,190 L280,220 L250,230 L230,220 L230,200"
                className={`${getColor(regionsData.find(r => r.id === "normandie")?.value)} cursor-pointer transition-colors hover:brightness-110 stroke-gray-300`}
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionsData.find(r => r.id === "normandie"))}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <path
                id="bourgogne-franche-comte"
                d="M340,240 L380,230 L390,260 L370,280 L330,270 L340,240"
                className={`${getColor(regionsData.find(r => r.id === "bourgogne-franche-comte")?.value)} cursor-pointer transition-colors hover:brightness-110 stroke-gray-300`}
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionsData.find(r => r.id === "bourgogne-franche-comte"))}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <path
                id="centre-val-de-loire"
                d="M270,270 L310,250 L320,280 L290,300 L270,290 L270,270"
                className={`${getColor(regionsData.find(r => r.id === "centre-val-de-loire")?.value)} cursor-pointer transition-colors hover:brightness-110 stroke-gray-300`}
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionsData.find(r => r.id === "centre-val-de-loire"))}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <path
                id="corse"
                d="M460,450 L470,440 L480,450 L475,470 L460,470 L460,450"
                className={`${getColor(regionsData.find(r => r.id === "corse")?.value)} cursor-pointer transition-colors hover:brightness-110 stroke-gray-300`}
                strokeWidth="1"
                onMouseEnter={() => setHoveredRegion(regionsData.find(r => r.id === "corse"))}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              
              {/* City labels for main regions */}
              <text x="305" y="265" className="text-[8px] font-medium">Paris</text>
              <text x="360" y="350" className="text-[8px] font-medium">Lyon</text>
              <text x="405" y="410" className="text-[8px] font-medium">Marseille</text>
              <text x="240" y="380" className="text-[8px] font-medium">Bordeaux</text>
              <text x="330" y="410" className="text-[8px] font-medium">Toulouse</text>
              
              {/* Tooltip */}
              {hoveredRegion && (
                <g>
                  <rect
                    x={290}
                    y={520}
                    width={220}
                    height={60}
                    rx={4}
                    className="fill-white stroke-gray-300"
                    strokeWidth={1}
                  />
                  <text x={300} y={540} className="text-[14px] font-bold">{hoveredRegion.name}</text>
                  <text x={300} y={560} className="text-[12px]">€{hoveredRegion.value.toLocaleString()}</text>
                </g>
              )}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="w-full lg:w-48 space-y-2">
            <h3 className="text-sm font-medium mb-2">Top Regions by Revenue</h3>
            {regionsData.slice(0, 5).map((region, index) => (
              <div key={region.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${getColor(region.value)}`}></div>
                  <span className="text-sm">{region.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  €{region.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};