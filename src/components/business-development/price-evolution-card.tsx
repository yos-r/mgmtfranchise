import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/hooks/useCurrency';
const PriceEvolutionCard = () => {
  const {formatCurrency} = useCurrency();
  // Static data for price evolution over 10 years
  const priceData = [
    { year: '2015', apartment: 3850, house: 2100, commercial: 4200 },
    { year: '2016', apartment: 4000, house: 2190, commercial: 4350 },
    { year: '2017', apartment: 4150, house: 2300, commercial: 4420 },
    { year: '2018', apartment: 4380, house: 2450, commercial: 4600 },
    { year: '2019', apartment: 4720, house: 2680, commercial: 4850 },
    { year: '2020', apartment: 4900, house: 2800, commercial: 4780 },
    { year: '2021', apartment: 5320, house: 3100, commercial: 4950 },
    { year: '2022', apartment: 5650, house: 3350, commercial: 5200 },
    { year: '2023', apartment: 5800, house: 3450, commercial: 5400 },
    { year: '2024', apartment: 5950, house: 3520, commercial: 5600 },
  ];

  // Filter by region
  const [region, setRegion] = useState('national');

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded border border-gray-200">
          <p className="font-bold text-gray-800">{`Année: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name === 'apartment' && 'Appartements: '}
              {entry.name === 'house' && 'Maisons: '}
              {entry.name === 'commercial' && 'Commerces: '}
              {`${formatCurrency(entry.value)}/m²`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format Y-axis ticks
  const formatYAxis = (value) => {
    return formatCurrency(value)
    // return `${value} €`;
  };

  return (
    <Card className="w-full  shadow-md">
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <div>
            {/* <CardTitle>Évolution des prix immobiliers</CardTitle> */}
          <h2 className="text-2xl font-bold text-gray-800">Évolution des prix immobiliers</h2>

            <CardDescription>Prix au m² entre 2015 et 2024</CardDescription>
          </div>
          {/* <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Région" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="national">France entière</SelectItem>
              <SelectItem value="paris">Paris</SelectItem>
              <SelectItem value="lyon">Lyon</SelectItem>
              <SelectItem value="marseille">Marseille</SelectItem>
              <SelectItem value="bordeaux">Bordeaux</SelectItem>
            </SelectContent>
          </Select> */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={priceData}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" stroke="#888888" />
              <YAxis tickFormatter={formatYAxis} stroke="#888888" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="apartment"
                name="Appartements"
                stroke="#121212"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="house"
                name="Maisons"
                stroke="#746649"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="commercial"
                name="Commerces"
                stroke="#6E8FAF"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* <div className="mt-4 text-sm text-gray-500">
          <p>Source: Données statistiques de l'immobilier 2024 Statbel</p>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default PriceEvolutionCard;