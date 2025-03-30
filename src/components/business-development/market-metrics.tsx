import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Clock, Home, BarChart3, LineChart, TrendingUp, TrendingDown, 
  AlertCircle, ChevronLeft, ChevronRight 
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from "@/components/ui/button";

interface MarketMetricsProps {
    listingsForSale: number;
    listingsForRent: number;
    averageDaysOnMarket?: number;
    propertyTypes?: number;
    marketGrowth?: string;
    priceTrend?: string;
}

const MarketMetrics = ({
    listingsForSale,
    listingsForRent,
    averageDaysOnMarket = 45,
    propertyTypes = 8,
    marketGrowth = "+5.2%",
    priceTrend = "Upward"
}: MarketMetricsProps) => {
    // Calculate percentage for pie chart
    const totalListings = listingsForSale + listingsForRent;
    const salePercentage = Math.round((listingsForSale / totalListings) * 100);
    const rentPercentage = Math.round((listingsForRent / totalListings) * 100);

    // Data for the donut chart
    const pieData = [
        { name: 'For Sale', value: listingsForSale, color: '#BEaf87' },
        { name: 'For Rent', value: listingsForRent, color: '#252526' }
    ];

    // Determine if trend is up or down for market growth
    const isGrowthPositive = marketGrowth.includes('+');

    // Format days on market rating
    const daysRating = averageDaysOnMarket < 30 ? "Excellent" :
        averageDaysOnMarket < 45 ? "Good" :
            averageDaysOnMarket < 60 ? "Average" : "Slow";

    // State for scrollable cards
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    
    // Define the health indicator cards
    const healthIndicatorCards = [
        // Days on Market
        {
            icon: <Clock className="h-5 w-5 text-relentlessgold" />,
            title: "Days on Market",
            value: `${averageDaysOnMarket} days`,
            alertIcon: <AlertCircle className="h-4 w-4 text-relentlessgold mr-2" />,
            description: `This is ${averageDaysOnMarket < 45 ? 'faster' : 'slower'} than the city average of 45 days`
        },
        // Market Growth
        {
            icon: <BarChart3 className="h-5 w-5 text-obsessedgrey" />,
            title: "Market Growth",
            value: marketGrowth,
            alertIcon: <AlertCircle className="h-4 w-4 text-obsessedgrey mr-2" />,
            description: `The market is ${isGrowthPositive ? 'growing' : 'shrinking'} year-over-year`
        },
        // Property Diversity
        {
            icon: <Home className="h-5 w-5 text-relentlessgold" />,
            title: "Property Diversity",
            value: `${propertyTypes} types`,
            alertIcon: <AlertCircle className="h-4 w-4 text-relentlessgold mr-2" />,
            description: "Diverse market with multiple property options"
        },
        // Price Trend
        {
            icon: <LineChart className="h-5 w-5 text-obsessedgrey" />,
            title: "Price Trend",
            value: priceTrend,
            alertIcon: <AlertCircle className="h-4 w-4 text-obsessedgrey mr-2" />,
            description: `Prices are ${priceTrend.toLowerCase() === "upward" ? 'increasing' : 'decreasing'} steadily`
        }
    ];
    
    // Total number of cards
    const totalCards = healthIndicatorCards.length;
    
    // Scroll logic
    const scrollLeft = () => {
        setCurrentCardIndex(prev => (prev - 1 + totalCards) % totalCards);
    };
    
    const scrollRight = () => {
        setCurrentCardIndex(prev => (prev + 1) % totalCards);
    };
    
    // Get the two cards to display
    const firstCardIndex = currentCardIndex;
    const secondCardIndex = (currentCardIndex + 1) % totalCards;

    // Custom tooltip for pie chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 shadow-lg rounded-md border border-gray-100">
                    <p className="font-medium">{payload[0].name}</p>
                    <p className="text-sm">{payload[0].value} listings ({payload[0].name === 'For Sale' ? salePercentage : rentPercentage}%)</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="shadow-md overflow-hidden">
            <CardHeader className="border-b pb-4 mb-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Market metrics</h2>
                    {/* <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#beaf87]/50 text-[#746649]">Updated today</span> */}
                </div>
            </CardHeader>

            <Tabs defaultValue="overview" className="w-full">
                <div className="px-6 pt-">
                    <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-3">
                        {/* Property Distribution Visualization */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="text-lg font-medium text-gray-700 mb-6">Property Distribution</h4>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-around mt-8">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-[#beaf87] mr-2"></div>
                                    <span className="text-sm">For Sale: {salePercentage}%</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-[#252526] mr-2"></div>
                                    <span className="text-sm">For Rent: {rentPercentage}%</span>
                                </div>
                            </div>
                        </div>

                        {/* KPIs in a more visual format */}
                        <div className="bg-white p-4 rounded-lg shadow-sm grid grid-rows-2 gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Days on Market */}
                                <div className="flex flex-col justify-between p-3 bg-relentlessgold/30 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-medium text-darkgold bg-white bg-opacity-50 px-2 py-1 rounded-full">
                                            Days on market
                                        </span>
                                        <Clock className="h-4 w-4 text-darkgold" />
                                    </div>
                                    <div>
                                        <p className="text-5xl font-bold text-darkgold">{averageDaysOnMarket} <p className="-ml-2 text-lg inline">days</p></p>
                                        <div className="flex items-center mt-1">
                                            <span className="text-sm text-darkgold">{daysRating}</span>
                                            {/* <span className={`text-xs ml-2 px-1.5 py-0.5 rounded ${daysRating === "Excellent" ? "bg-darkgold text-white" :
                                                    daysRating === "Good" ? "bg-darkgold text-white" :
                                                        daysRating === "Average" ? "bg-darkgold text-white" :
                                                            "bg-red-100 text-red-800"
                                                }`}>
                                                {daysRating === "Excellent" && "Fast Market"}
                                                {daysRating === "Good" && "Normal"}
                                                {daysRating === "Average" && "Moderate"}
                                                {daysRating === "Slow" && "Slow Market"}
                                            </span> */}
                                        </div>
                                    </div>
                                </div>

                                {/* Property Types */}
                                <div className="flex flex-col justify-between p-3 bg-obsessedgrey rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-medium text-white bg-white bg-opacity-50 px-2 py-1 rounded-full">
                                            Variety
                                        </span>
                                        <Home className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-5xl font-bold text-white">{propertyTypes}</p>
                                        <div className="flex items-center mt-1">
                                            <span className="text-sm text-white">Property Types</span>
                                            {/* <span className="text-xs ml-2 px-1.5 py-0.5 rounded bg-white text-obsessedgrey">
                                                Diverse
                                            </span> */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Market Growth */}
                                <div className="flex flex-col justify-between p-3 bg-darkgold rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-medium text-white bg-white bg-opacity-50 px-2 py-1 rounded-full">
                                            Growth
                                        </span>
                                        <BarChart3 className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">{marketGrowth}</p>
                                        <div className="flex items-center mt-1">
                                            <span className="text-sm text-white">Annual Change</span>
                                            {/* {isGrowthPositive ? (
                                                <span className="flex items-center text-xs ml-2 px-1.5 py-0.5 rounded bg-white text-darkgold">
                                                    <TrendingUp className="h-3 w-3 mr-1" /> Rising
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-xs ml-2 px-1.5 py-0.5 rounded bg-white text-darkgold">
                                                    <TrendingDown className="h-3 w-3 mr-1" /> Falling
                                                </span>
                                            )} */}
                                        </div>
                                    </div>
                                </div>

                                {/* Price Trend */}
                                <div className="flex flex-col justify-between p-3 bg-obsessedgrey/15 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-medium text-obsessedgrey bg-white bg-opacity-50 px-2 py-1 rounded-full">
                                            Pricing
                                        </span>
                                        <LineChart className="h-4 w-4 text-obsessedgrey" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-obsessedgrey">{priceTrend}</p>
                                        <div className="flex items-center mt-1">
                                            <span className="text-sm text-obsessedgrey">Price Trend</span>
                                            {/* <span className="flex items-center text-xs ml-2 px-1.5 py-0.5 rounded bg-obsessedgrey text-white">
                                                {priceTrend.toLowerCase() === "upward" ? (
                                                    <><TrendingUp className="h-3 w-3 mr-1" /> Rising</>
                                                ) : (
                                                    <><TrendingDown className="h-3 w-3 mr-1" /> Falling</>
                                                )}
                                            </span> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="details" className="p-4 py-0">
                    <div className="space-y-3 grid">
                        <div className="bg-white p-4  pb-2 rounded-lg shadow-sm ">
                            <h4 className="text-sm font-medium text-gray-600 mb-3">Sale vs. Rent Trends</h4>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-[#beaf87] mr-2"></div>
                                            <span className="text-sm font-medium">For Sale</span>
                                        </div>
                                        <span className="text-sm font-medium">{listingsForSale} listings</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-200">
                                        <div
                                            className="bg-[#beaf87] h-2.5 rounded-full"
                                            style={{ width: `${salePercentage}%` }}
                                        />
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500 flex justify-between">
                                        <span>{salePercentage}% of inventory</span>
                                        <span className="text-[#746649] font-medium">+2.1% vs. last month</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-[#252526] mr-2"></div>
                                            <span className="text-sm font-medium">For Rent</span>
                                        </div>
                                        <span className="text-sm font-medium">{listingsForRent} listings</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-200">
                                        <div
                                            className="bg-[#252526] h-2.5 rounded-full"
                                            style={{ width: `${rentPercentage}%` }}
                                        />
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500 flex justify-between">
                                        <span>{rentPercentage}% of inventory</span>
                                        <span className="text-[#252526] font-medium">-1.3% vs. last month</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-600">Market Health Indicators</h4>
                                <div className="flex space-x-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 w-7 p-0 rounded-full" 
                                        onClick={scrollLeft}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 w-7 p-0 rounded-full" 
                                        onClick={scrollRight}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* First visible card */}
                                <div className="space-y-2 p-3 border border-gray-100 rounded-lg transition-all duration-300 ease-in-out shadow-sm hover:shadow">
                                    <div className="flex items-center space-x-2">
                                        {healthIndicatorCards[firstCardIndex].icon}
                                        <span className="text-sm font-medium">{healthIndicatorCards[firstCardIndex].title}</span>
                                    </div>
                                    <p className="text-2xl font-bold">{healthIndicatorCards[firstCardIndex].value}</p>
                                    <div className="flex items-center">
                                        {healthIndicatorCards[firstCardIndex].alertIcon}
                                        <span className="text-xs text-gray-600">
                                            {healthIndicatorCards[firstCardIndex].description}
                                        </span>
                                    </div>
                                </div>

                                {/* Second visible card */}
                                <div className="space-y-2 p-3 border border-gray-100 rounded-lg transition-all duration-300 ease-in-out shadow-sm hover:shadow">
                                    <div className="flex items-center space-x-2">
                                        {healthIndicatorCards[secondCardIndex].icon}
                                        <span className="text-sm font-medium">{healthIndicatorCards[secondCardIndex].title}</span>
                                    </div>
                                    <p className="text-2xl font-bold">{healthIndicatorCards[secondCardIndex].value}</p>
                                    <div className="flex items-center">
                                        {healthIndicatorCards[secondCardIndex].alertIcon}
                                        <span className="text-xs text-gray-600">
                                            {healthIndicatorCards[secondCardIndex].description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Indicator dots */}
                            <div className="flex justify-center space-x-2 mt-4">
                                {healthIndicatorCards.map((_, index) => (
                                    <div 
                                        key={`indicator-${index}`} 
                                        className={`h-1.5 rounded-full ${index === firstCardIndex || index === secondCardIndex 
                                            ? 'w-6 bg-[#beaf87]' 
                                            : 'w-2 bg-gray-300'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </Card>
    );
};

export default MarketMetrics;