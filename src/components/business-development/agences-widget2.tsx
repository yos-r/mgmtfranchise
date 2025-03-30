import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Card } from '../ui/card';
const AgencesWidget2 = () => {
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

    // Add total and calculate percentages for ratios
    const dataWithRatios = agencesData.map(agency => {
        const totalVolume = agency.vente + agency.location;
        const totalRevenue = agency.revenuVente + agency.revenuLocation;

        return {
            ...agency,
            // For volume metrics
            total: totalVolume,
            ventePercent: (agency.vente / totalVolume) * 100,
            locationPercent: (agency.location / totalVolume) * 100,

            // For revenue metrics
            revenuTotal: totalRevenue,
            revenuVentePercent: (agency.revenuVente / totalRevenue) * 100,
            revenuLocationPercent: (agency.revenuLocation / totalRevenue) * 100
        };
    }).sort((a, b) => b.total - a.total);

    // State for view mode
    const [viewMode, setViewMode] = useState('volume'); // 'volume' or 'revenue'

    // Colors - using consistent color scheme for both visualizations
    const venteColor = "#beaf87"; // Indigo
    const locationColor = "#1f1f2f"; // Sky

    // Get data keys based on view mode
    const getDataKeys = () => {
        if (viewMode === 'volume') {
            return {
                ventePct: 'ventePercent',
                locationPct: 'locationPercent',
                venteVal: 'vente',
                locationVal: 'location',
                totalVal: 'total',
                label1: 'Biens en vente',
                label2: 'Biens en location'
            };
        } else {
            return {
                ventePct: 'revenuVentePercent',
                locationPct: 'revenuLocationPercent',
                venteVal: 'revenuVente',
                locationVal: 'revenuLocation',
                totalVal: 'revenuTotal',
                label1: 'Revenus des ventes',
                label2: 'Revenus des locations'
            };
        }
    };

    const { ventePct, locationPct, venteVal, locationVal, totalVal, label1, label2 } = getDataKeys();

    // Format percentage
    const formatPercentage = (value) => {
        return `${Math.round(value)}%`;
    };

    // Custom tooltip for the charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const isRevenue = viewMode === 'revenue';
            const agency = dataWithRatios.find(a => a.nom === label);

            if (!agency) return null;

            const venteValue = agency[venteVal];
            const locationValue = agency[locationVal];
            const ventePctValue = agency[ventePct];
            const locationPctValue = agency[locationPct];

            return (
                <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
                    <p className="font-bold text-gray-800">{label}</p>
                    <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: venteColor }}></div>
                            <p className="text-sm">
                                {label1}: <span className="font-medium">
                                    {isRevenue ? formatCurrency(venteValue) : venteValue}
                                </span> <span className="text-gray-500 ml-1">({formatPercentage(ventePctValue)})</span>
                            </p>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: locationColor }}></div>
                            <p className="text-sm">
                                {label2}: <span className="font-medium">
                                    {isRevenue ? formatCurrency(locationValue) : locationValue}
                                </span> <span className="text-gray-500 ml-1">({formatPercentage(locationPctValue)})</span>
                            </p>
                        </div>
                        <div className="mt-1 pt-1 border-t border-gray-200">
                            <p className="text-sm font-medium">
                                Total: <span className="font-bold">
                                    {isRevenue ? formatCurrency(agency[totalVal]) : agency[totalVal]}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <div className="bg-white p-6 rounded-xl shadow-xl w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Les agences immobilières et le marché</h2>
                        <p className="text-gray-500"><b>92 </b>agences immobilières pour <b>564</b> biens en vente et <b>336</b> biens en location</p>
                    </div>
                    <div>
                        <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-lg border-2 flex gap-x-1 items-center">
                            <img src="https://play-lh.googleusercontent.com/TtrYB0lXuRx5tJFP0Q8L2xFn245LLP5vRbZaPh0x7PxuSwUfmbV3WLiHwrRp296pVCg" className="w-4 h-4 inline rounded-sm" />
                            <span>Immoweb</span>
                        </div>
                        {/* <Select value={viewMode} onValueChange={setViewMode}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Mode d'affichage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="volume">Nombre de biens</SelectItem>
                                <SelectItem value="revenue">Revenus</SelectItem>
                            </SelectContent>
                        </Select> */}
                    </div>
                </div>
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Left side: Horizontal bars with consistent styling */}
                    <div className="rounded-lg border border-gray-200 p-4 bg-white">
                        <div className="space-y-3">
                            {dataWithRatios.map((agence, index) => {
                                const ventePctValue = agence[ventePct];
                                const locationPctValue = agence[locationPct];
                                return (
                                    <div key={`ratio-${agence.nom}`} className="flex flex-col">
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span className="font-medium">{agence.nom}</span>
                                            <span>{formatPercentage(ventePctValue)} / {formatPercentage(locationPctValue)}</span>
                                        </div>
                                        <div className="h-7 w-full bg-gray-100 rounded-md overflow-hidden flex">
                                            <div
                                                className="h-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                                                style={{ width: `${ventePctValue}%`, backgroundColor: venteColor }}
                                            >
                                                {ventePctValue > 15 && 'Vente'}
                                            </div>
                                            <div
                                                className="h-full flex items-center justify-start pl-2 text-xs text-white font-medium"
                                                style={{ width: `${locationPctValue}%`, backgroundColor: locationColor }}
                                            >
                                                {locationPctValue > 15 && 'Location'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Right side: Table with consistent styling */}
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agence</th>
                                    {viewMode === 'volume' ? (
                                        <>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vente (%)</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Location (%)</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Biens</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Market Share (%)</th>

                                        </>
                                    ) : (
                                        <>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rev. Vente (%)</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rev. Location (%)</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenus</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {dataWithRatios.map((agence, index) => (
                                    <tr
                                        key={agence.nom}
                                        className={`hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-relentlessgold/20' : ''}`}
                                    >
                                        <td className="py-3 px-4 text-gray-800 font-medium">
                                            <div className="flex items-center">
                                                {index === 0 && (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full text-xs font-bold" style={{ backgroundColor: `${venteColor}80`, color: 'white' }}>1</span>
                                                )}
                                                {agence.nom}
                                            </div>
                                        </td>
                                        {viewMode === 'volume' ? (
                                            <>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <span className="font-medium text-gray-800">{Math.round(agence.ventePercent)}%</span>
                                                        <span className="text-gray-500 ml-2">({agence.vente})</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <span className="font-medium text-gray-800">{Math.round(agence.locationPercent)}%</span>
                                                        <span className="text-gray-500 ml-2">({agence.location})</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center text-gray-800 font-bold">{agence.total}</td>
                                                <td className="py-3 px-4 text-center text-gray-800 font-bold">{Math.floor(agence.total / 500 * 100)}%</td>

                                            </>
                                        ) : (
                                            <>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <span className="font-medium text-gray-800">{Math.round(agence.revenuVentePercent)}%</span>
                                                        <span className="text-gray-500 ml-2">({formatCurrency(agence.revenuVente)})</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <span className="font-medium text-gray-800">{Math.round(agence.revenuLocationPercent)}%</span>
                                                        <span className="text-gray-500 ml-2">({formatCurrency(agence.revenuLocation)})</span>
                                                    </div>
                                                </td>
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
        </Card>
    );
};

export default AgencesWidget2;