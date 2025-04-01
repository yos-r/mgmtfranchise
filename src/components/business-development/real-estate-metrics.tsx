import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Home, Building, BarChart2, Users, Map, History, Clock } from 'lucide-react';

const RealEstateMetrics = () => {
    // You can replace these with dynamic data if needed
    const ownerOccupiedPercentage = 26.6;
    const buildingCount = 14446;
    const builtSurfacePercentage = 63.8;

    return (
        <Card className="w-full shadow-md overflow-hidden">
            <CardHeader className=" border-b pb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Statistiques des bâtiments </h2>
                    <div className='bg-gray-50/50 p-2 -mx-2 border rounded-lg -mb-2 -mt-2'>
                        <img src="https://upload.wikimedia.org/wikipedia/fr/b/bc/Statbel_%28logo%29.svg" className='h-4 ' alt="" />
                    </div>                    
                                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Building Count */}
                    <div className="flex flex-col justify-between p-4  bg-[#252526]/10 rounded-lg shadow-sm h-40">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-[#252526] bg-white bg-opacity-70 px-2 py-1 rounded-full">
                                Inventaire
                            </span>
                            <Building className="h-5 w-5 text-[#252526]" />
                        </div>
                        <div className="flex flex-col items-center mt-3">
                            <h3 className="text-sm font-medium text-gray-700 mb-1 text-center">Nombre de bâtiments en 2024</h3>
                            <p className="text-4xl font-bold text-[#252526]">{buildingCount.toLocaleString('fr-FR')}</p>
                        </div>
                        <div className="mt- flex justify-center items-center space-x-1 ">
                            <BarChart2 className="h-3 w-3 text-[#252526]" />
                            <span className="text-xs text-[#252526]">+2.8% depuis 2023</span>
                        </div>
                    </div>
                    {/* Built Surface */}
                    <div className="flex flex-col justify-between p-4 bg-[#beaf87]/30 rounded-lg shadow-sm h-40">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-[#746649] bg-white bg-opacity-70 px-2 py-1 rounded-full">
                                Superficie
                            </span>
                            <Map className="h-5 w-5 text-darkgold" />
                        </div>
                        <div className="flex flex-col items-center mt-3">
                            <h3 className="text-sm font-medium text-gray-700 mb-1 text-center">Surface bâtie en 2024</h3>
                            <p className="text-4xl font-bold text-[#746649]">{builtSurfacePercentage}%</p>
                        </div>
                        <div className="mt-2 flex justify-center">
                            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-1 bg-darkgold"
                                    style={{ width: `${builtSurfacePercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                    {/* Owner Occupied Housing */}
                    <div className="flex flex-col justify-between p-4 bg-[#beaf87]/30 rounded-lg shadow-sm h-40">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-[#746649] bg-white bg-opacity-70 px-2 py-1 rounded-full">
                                Propriété
                            </span>
                            <Users className="h-5 w-5 text-[#746649]" />
                        </div>
                        <div className="flex flex-col items-center mt-3">
                            <h3 className="text-sm font-medium text-gray-700 mb-1 text-center">Logements occupés par leur propriétaire</h3>
                            <p className="text-4xl font-bold text-[#746649]">{ownerOccupiedPercentage}%</p>
                        </div>
                        <div className="mt-2 flex justify-center">
                            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-1 bg-[#beaf87]"
                                    style={{ width: `${ownerOccupiedPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>





                    {/* <div className="flex flex-col justify-between p-4 bg-[#252526]/10 rounded-lg shadow-sm h-40">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-obsessedblack bg-white bg-opacity-70 px-2 py-1 rounded-full">
                                Ancienneté
                            </span>
                            <Clock className="h-5 w-5 text-obsessedblack" />
                        </div>
                        <div className="flex flex-col items-center mt-3">
                            <h3 className="text-sm font-medium text-gray-700 mb-1 text-center">Âge moyen des bâtiments</h3>
                            <p className="text-4xl font-bold text-obsessedblack">42 ans</p>
                        </div>
                        <div className="mt-2 flex justify-center items-center space-x-1">
                            <History className="h-3 w-3 text-obsessedblack" />
                            <span className="text-xs text-obsessedblack">31% avant 1950</span>
                        </div>
                    </div> */}
                </div>
            </CardContent>
        </Card>
    );
};

export default RealEstateMetrics;