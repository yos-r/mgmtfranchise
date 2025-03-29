import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import Papa from 'papaparse';

const BuildingEvolutionChart = () => {
  const [data, setData] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await window.fs.readFile('export.csv', { encoding: 'utf8' });
        
        const parsed = Papa.parse(response, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
        });
        
        // Filter for the three building types we want
        const filteredTypes = [
          "Buildings et immeubles à appartements",
          "Maisons de commerce",
          "Maisons de type fermé"
        ];
        
        const filteredData = parsed.data.filter(row => 
          filteredTypes.includes(row["Type de bâtiment"])
        );
        
        // Get all unique years
        const years = [...new Set(filteredData.map(row => row.Année))].sort();
        
        // Transform into the format needed for Recharts
        const chartData = years.map(year => {
          const yearData = { year };
          
          filteredTypes.forEach(type => {
            const match = filteredData.find(row => 
              row.Année === year && row["Type de bâtiment"] === type
            );
            // Use a shortened key name for easier access in the chart
            const typeKey = type === "Buildings et immeubles à appartements" ? "appartements" : 
                          type === "Maisons de commerce" ? "commerce" : "ferme";
            
            yearData[typeKey] = match ? match.Nombre : 0;
          });
          
          return yearData;
        });
        
        setData(chartData);
      } catch (error) {
        console.error("Error loading data:", error);
        // Fallback to sample data if we can't load the CSV
        setData(getSampleData());
      }
    };
    
    loadData();
  }, []);

  // Sample data in case the file can't be loaded
  const getSampleData = () => {
    return [
    //   { year: 1995, appartements: 1822, commerce: 2350, ferme: 8749 },
    //   { year: 2000, appartements: 2040, commerce: 2270, ferme: 8560 },
      { year: 2005, appartements: 2331, commerce: 2166, ferme: 8397 },
      { year: 2010, appartements: 2777, commerce: 2001, ferme: 8139 },
      { year: 2015, appartements: 3196, commerce: 1837, ferme: 7911 },
      { year: 2020, appartements: 3609, commerce: 1677, ferme: 7716 },
      { year: 2024, appartements: 4091, commerce: 1518, ferme: 7413 }
    ];
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const buildingType = payload[0].dataKey === "appartements" 
        ? "Buildings et immeubles à appartements"
        : payload[0].dataKey === "commerce" 
          ? "Maisons de commerce" 
          : "Maisons de type fermé";
      
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-semibold">Année: {label}</p>
          <p className="font-semibold">Nombre: {payload[0].value.toLocaleString('fr-FR')}</p>
          <p>Type de bâtiment: {buildingType}</p>
        </div>
      );
    }
    return null;
  };
  
  // Handle mouse over on data points
  const handleMouseOver = (data, index) => {
    setHoveredPoint(data);
  };
  
  return (
    <Card className="w-full md:w-1/ shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium text-gray-800">
          Évolution du nombre de bâtiment selon le type
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="year" 
                tickFormatter={(value) => value % 5 === 0 ? value : ''} 
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0, 10000]} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="appartements"
                name="Buildings et immeubles à appartements"
                stroke="#1A75C1"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6, onMouseOver: handleMouseOver }}
              />
              <Line
                type="monotone"
                dataKey="commerce"
                name="Maisons de commerce"
                stroke="#4EAAF7"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6, onMouseOver: handleMouseOver }}
              />
              <Line
                type="monotone"
                dataKey="ferme"
                name="Maisons de type fermé"
                stroke="#D6E8FF"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6, onMouseOver: handleMouseOver }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          {/* Vertical reference line for highlighted year (similar to image) */}
          {hoveredPoint && (
            <div 
              className="absolute top-20 bottom-10 w-px bg-gray-300"
              style={{ left: `calc(${hoveredPoint.cx}px - 1px)` }}
            ></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingEvolutionChart;