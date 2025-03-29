import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const AgencesWidget = () => {
  // Use the currency formatting hook
  const { formatCurrency } = useCurrency();

  // Fictional agency data with revenue values
  const agencesData = [
    { nom: "Agence Moderne", vente: 42, location: 28, revenuVente: 420000, revenuLocation: 112000 },
    { nom: "Immobilier Elite", vente: 38, location: 31, revenuVente: 380000, revenuLocation: 124000 },
    { nom: "Century 21", vente: 35, location: 24, revenuVente: 350000, revenuLocation: 96000 },
    { nom: "Orpi", vente: 31, location: 27, revenuVente: 310000, revenuLocation: 108000 },
    { nom: "FNAIM", vente: 29, location: 19, revenuVente: 290000, revenuLocation: 76000 },
  ];

  // Add total and calculate ranking
  const dataWithTotal = agencesData.map(agency => ({
    ...agency,
    total: agency.vente + agency.location,
    revenuTotal: agency.revenuVente + agency.revenuLocation
  })).sort((a, b) => b.total - a.total);

  // State for view mode, neighborhood and active bar
  const [viewMode, setViewMode] = useState('volume'); // 'volume' or 'revenue'
  const [quartier, setQuartier] = useState("Tous les quartiers");
  const [activeIndex, setActiveIndex] = useState(null);

  // Colors
  const venteColor = "#beaf87"; // Indigo
  const locationColor = "#525253"; // Sky
  const hoverOpacity = 0.8;

  // List of neighborhoods
  const quartiers = [
    "Tous les quartiers", 
    "Centre-ville", 
    "Saint-Michel", 
    "Les Chartrons", 
    "Bastide"
  ];

  // Get data keys based on view mode
  const getDataKeys = () => {
    if (viewMode === 'volume') {
      return {
        key1: 'vente',
        key2: 'location',
        label1: 'Biens en vente',
        label2: 'Biens en location'
      };
    } else {
      return {
        key1: 'revenuVente',
        key2: 'revenuLocation',
        label1: 'Revenus des ventes',
        label2: 'Revenus des locations'
      };
    }
  };

  const { key1, key2, label1, label2 } = getDataKeys();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isRevenue = viewMode === 'revenue';
      
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-bold text-gray-800">{label}</p>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-600 rounded-sm mr-2"></div>
              <p className="text-sm">
                {label1}: <span className="font-medium">
                  {isRevenue ? formatCurrency(payload[0].value) : payload[0].value}
                </span>
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-sky-500 rounded-sm mr-2"></div>
              <p className="text-sm">
                {label2}: <span className="font-medium">
                  {isRevenue ? formatCurrency(payload[1].value) : payload[1].value}
                </span>
              </p>
            </div>
            <div className="mt-1 pt-1 border-t border-gray-200">
              <p className="text-sm font-medium">
                Total: <span className="font-bold">
                  {isRevenue 
                    ? formatCurrency(payload[0].value + payload[1].value) 
                    : payload[0].value + payload[1].value}
                </span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatXAxisTick = (value) => {
    return viewMode === 'revenue' ? formatCurrency(value) : value;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl w-full ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Meilleures agences immobilières</h2>
          <p className="text-gray-500">Performance des agences par type de bien</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          
          
        <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Mode d'affichage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="volume">Nombre de biens</SelectItem>
              <SelectItem value="revenue">Revenus</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 mb-8 bg-gray-50 p-4 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataWithTotal}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                barGap={8}
                barSize={24}
                onMouseMove={(data) => {
                  if (data && data.activeTooltipIndex !== undefined) {
                    setActiveIndex(data.activeTooltipIndex);
                  }
                }}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickCount={5}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={formatXAxisTick}
                />
                <YAxis
                  type="category"
                  dataKey="nom"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                  width={80}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(229, 231, 235, 0.4)' }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '15px' }}
                  formatter={(value) => <span className="text-gray-700">
                    {value === key1 ? label1 : label2}
                  </span>}
                />
                <Bar dataKey={key1} name={key1} fill={venteColor} radius={[4, 4, 4, 4]}>
                  {dataWithTotal.map((entry, index) => (
                    <Cell
                      key={`cell-${key1}-${index}`}
                      fill={venteColor}
                      fillOpacity={activeIndex === index ? hoverOpacity : 1}
                    />
                  ))}
                </Bar>
                <Bar dataKey={key2} name={key2} fill={locationColor} radius={[4, 4, 4, 4]}>
                  {dataWithTotal.map((entry, index) => (
                    <Cell
                      key={`cell-${key2}-${index}`}
                      fill={locationColor}
                      fillOpacity={activeIndex === index ? hoverOpacity : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agence</th>
                  {viewMode === 'volume' ? (
                    <>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vente</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Revenus Vente</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Revenus Location</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Revenus Total</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dataWithTotal.map((agence, index) => (
                  <tr
                    key={agence.nom}
                    className={`hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-indigo-50' : ''}`}
                  >
                    <td className="py-3 px-4 text-gray-800 font-medium">
                      <div className="flex items-center">
                        {index === 0 && (
                          <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">1</span>
                        )}
                        {agence.nom}
                      </div>
                    </td>
                    {viewMode === 'volume' ? (
                      <>
                        <td className="py-3 px-4 text-center text-gray-800">{agence.vente}</td>
                        <td className="py-3 px-4 text-center text-gray-800">{agence.location}</td>
                        <td className="py-3 px-4 text-center text-gray-800 font-bold">{agence.total}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 text-center text-gray-800">{formatCurrency(agence.revenuVente)}</td>
                        <td className="py-3 px-4 text-center text-gray-800">{formatCurrency(agence.revenuLocation)}</td>
                        <td className="py-3 px-4 text-center text-gray-800 font-bold">{formatCurrency(agence.revenuTotal)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default AgencesWidget;