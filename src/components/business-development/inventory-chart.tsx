import React from 'react';
 import immowebLogo from '../../public/immoweb.png';

import {

    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const InventoryChart = ({area}:any) => {
    // Static data for inventory evolution
    const inventoryData = [
        { month: 'Jan 23', sale: 25, rent: 31 },
        { month: 'Mar 23', sale: 27, rent: 35 },
        { month: 'May 23', sale: 31, rent: 39 },
        { month: 'Jul 23', sale: 12, rent: 40 },
        { month: 'Sep 23', sale: 36, rent: 43 },
        { month: 'Nov 23', sale: 39, rent: 46 },
        { month: 'Jan 24', sale: 31, rent: 44 },
        { month: 'Mar 24', sale: 39, rent: 42 },
        { month: 'May 24', sale: 27, rent: 41 },
        { month: 'Jul 24', sale: 24, rent: 38 },
        { month: 'Sep 24', sale: 22, rent: 37 },
        { month: 'Nov 24', sale: 24, rent: 35 },
    ];

    // Calculate percentage changes over last period
    // const currentSale = [inventoryData.length - 1].sale;
    const currentSale=area.listingsForSale
    const previousSale = inventoryData[inventoryData.length - 2].sale;
    const salePercentChange = ((inventoryData[inventoryData.length - 1].sale - previousSale) / previousSale * 100).toFixed(1);
    const isSaleIncreasing = salePercentChange > 0;

    const currentRent = area.listingsForRent;
    const previousRent = inventoryData[inventoryData.length - 2].rent;
    const rentPercentChange = ((inventoryData[inventoryData.length - 1].rent - previousRent) / previousRent * 100).toFixed(1);
    const isRentIncreasing = rentPercentChange > 0;

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-sm border border-gray-200 rounded-md">
                    <p className="text-sm font-semibold">{`${label}`}</p>
                    <div className="flex items-center mt-2">
                        <div className="w-3 h-3 rounded-full bg-[#beaf87] mr-2"></div>
                        <p className="text-sm text-gray-700">{`Vente: ${payload[0].value} annonces`}</p>
                    </div>
                    <div className="flex items-center mt-1">
                        <div className="w-3 h-3 rounded-full bg-[#252526] mr-2"></div>
                        <p className="text-sm text-gray-700">{`Location: ${payload[1].value} annonces`}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Inventaire des annonces immobilières</h2>
                    <div className=" text-blue-800 text-sm font-medium -mx-3 mt-1 -p rounded-lg  flex gap-x-1 items-center">
                    <img src={immowebLogo} className="h-6 inline rounded-sm" alt="Immoweb" />
                    {/* <span>Immoweb</span> */}
                        </div>
                </div>
            </CardHeader>

            <div className="p-6 pt-5">
                <div className="flex justify-between">
                    <div>
                        <span className="text-sm text-gray-500">Vente</span>
                        <div className="text-3xl font-bold text-gray-900">
                            {currentSale.toLocaleString()} <span className="text-base font-medium">annonces</span>
                        </div>
                        <div className="flex items-center mt-1">
                            <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isSaleIncreasing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isSaleIncreasing ? 
                                    <TrendingUp className="h-3 w-3 mr-1" /> : 
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                }
                                <span>{isSaleIncreasing ? '+' : ''}{salePercentChange}%</span>
                            </div>
                            <span className="ml-2 text-gray-500 text-xs">vs mois précédent</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-sm text-gray-500">Location</span>
                        <div className="text-3xl font-bold text-gray-900">
                            {currentRent.toLocaleString()} <span className="text-base font-medium">annonces</span>
                        </div>
                        <div className="flex items-center mt-1">
                            <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isRentIncreasing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isRentIncreasing ? 
                                    <TrendingUp className="h-3 w-3 mr-1" /> : 
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                }
                                <span>{isRentIncreasing ? '+' : ''}{rentPercentChange}%</span>
                            </div>
                            <span className="ml-2 text-gray-500 text-xs">vs mois précédent</span>
                        </div>
                    </div>
                </div>

                <div className="h-64 mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={inventoryData}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                interval={1}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                iconType="circle"
                                wrapperStyle={{ paddingTop: 10 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="sale"
                                name="Vente"
                                stroke="#beaf87"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 1 }}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="rent"
                                name="Location"
                                stroke="#252526"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 1 }}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};

export default InventoryChart;