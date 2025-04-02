import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Building, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';

const ApartmentPriceChart = () => {
    // Static data for apartment price evolution
    const priceData = [
        { year: '2010', price: 2684 },
        { year: '2011', price: 2900 },    // Rising to about 108-110%
        { year: '2012', price: 3060 },    // Rising to about 114%
        { year: '2013', price: 3140 },    // Slight increase to ~117%
        { year: '2014', price: 3165 },    // Slight decline in growth rate to ~118%
        { year: '2015', price: 3140 },    // Minor dip to ~117%
        { year: '2016', price: 3168 },    // Slight rise to ~118%
        { year: '2017', price: 3247 },    // Rising to ~121%
        { year: '2018', price: 3355 },    // Rising to ~125% 
        { year: '2019', price: 3489 },    // Rising to ~130%
        { year: '2020', price: 3704 },    // Sharp rise to ~138%
        { year: '2021', price: 4000 },    // Rising to ~149%
        { year: '2022', price: 4133 },    // Rising to ~154%
        { year: '2023', price: 4160 },    // Minor fluctuation to ~155%
        { year: '2024', price: 4241 },    // Exactly 158% as specified
        // { year: '2025', price: 4350 },    // Continued upward trend to ~162%
    ];

    // Calculate percentage change over last 12 months
    const currentPrice = priceData[priceData.length - 2].price;
    const previousPrice = priceData[priceData.length - 3].price;
    const percentChange = 1.95;
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
                    <h2 className="text-xl font-bold text-gray-800">Appartements - Prix au m² moyen</h2>
                    <div className='bg-gray-50/50 p-2 -mx-2 border rounded-lg -mb-2 -mt-2'>
                        <img src="https://upload.wikimedia.org/wikipedia/fr/b/bc/Statbel_%28logo%29.svg" className='h-4 ' alt="" />
                    </div>
                </div>
            </CardHeader>


            <div className=" p-6 pt-5">
                <div className="text-5xl font-bold text-gray-900">
                    {/* {priceData[priceData.length - 2].price.toLocaleString()}€/m² */}
                    4,241€/m²
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
                                    <stop offset="5%" stopColor="#BEAF87" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#BEAF87" stopOpacity={0.2} />
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
                                domain={[1000, 4500]}
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
                                stroke="#746649"
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

export default ApartmentPriceChart;