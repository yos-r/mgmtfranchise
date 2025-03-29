import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Building, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';

const HousePriceChart = () => {
    // Static data for apartment price evolution
    const priceData = [
        { year: '2015', price: 5200 },
        { year: '2016', price: 5100 },
        { year: '2017', price: 5300 },
        { year: '2018', price: 5700 },
        { year: '2019', price: 5200 },
        { year: '2020', price: 5500 },
        { year: '2021', price: 6100 },
        { year: '2022', price: 6300 },
        { year: '2023', price: 6200 },
        { year: '2024', price: 6279 },
        { year: '2025', price: 6700 },
    ];

    // Calculate percentage change over last 12 months
    const currentPrice = priceData[priceData.length - 2].price;
    const previousPrice = priceData[priceData.length - 3].price;
    const percentChange = ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2);
    const isNegative = percentChange < 0;

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-sm border border-gray-200 rounded-md">
                    <p className="text-sm font-semibold">{`${label}`}</p>
                    <p className="text-sm text-gray-700">{`${payload[0].value.toLocaleString()} €/m²`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader className=" border-b pb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Maisons - Prix au m² moyen</h2>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#beaf87]/50 text-[#746649]">Statbel</span>
                </div>
            </CardHeader>


            <div className=" p-6 pt-5">
                <div className="text-5xl font-bold text-gray-900">
                    {priceData[priceData.length - 2].price.toLocaleString()}€/m²
                </div>

                <div className="flex items-center mt-2">
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${isNegative ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {isNegative && <TrendingDown className="h-4 w-4 mr-1" />}
                        <span>{isNegative ? '' : '+'}{percentChange}%</span>
                    </div>
                    <span className="ml-2 text-gray-500 text-sm">depuis 12 mois</span>
                </div>
                <div className="h-64 mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={priceData}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1f295d" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#1f295d" stopOpacity={0.2} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="year"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            />
                            <YAxis
                                domain={[5000, 8000]}
                                tickFormatter={(value) => `${value / 1000}K€/m²`}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={priceData[priceData.length - 2].price} stroke="#746649" strokeDasharray="3 3" />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#252526"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};

export default HousePriceChart;