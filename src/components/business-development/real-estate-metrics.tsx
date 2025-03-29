import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const RealEstateMetrics = () => {
    // You can replace these with dynamic data if needed
    const ownerOccupiedPercentage = 26.6;
    const buildingCount = 14446;

    // Calculate the stroke offset for the gauge
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    // We're only showing a semi-circle (180 degrees), so we use half the circumference
    const halfCircumference = circumference / 2;
    // Calculate the stroke-dashoffset based on the percentage
    // For a semi-circle, 0% = halfCircumference, 100% = 0
    const strokeOffset = halfCircumference - (ownerOccupiedPercentage / 100) * halfCircumference;

    return (
        <Card className="w-full shadow-sm">
            <CardContent className="py-3">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-gray-700 m">Logements occupés par leur propriétaire</h2>


                        <div className="relative w-48 h-24 flex justify-center">
                            

                            {/* Percentage value */}
                            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-center">
                                <p className="text-4xl font-bold text-gray-700">{ownerOccupiedPercentage}%</p>
                            </div>
                        </div>

                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-gray-700 m">Nombre de bâtiments en 2024</h2>


                        <div className="relative w-48 h-24 flex justify-center">
                            

                            {/* Percentage value */}
                            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-center">
                                <p className="text-4xl font-bold text-[#beaf87]">{buildingCount.toLocaleString('fr-FR')}</p>
                            </div>
                        </div>

                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-gray-700 m">Surface bâtie en 2024 </h2>


                        <div className="relative w-48 h-24 flex justify-center">
                            

                            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-center">
                                <p className="text-4xl font-bold text-[#1a1a1a]">63.8%</p>
                            </div>
                        </div>

                    </div>

                    

                </div>
            </CardContent>
        </Card>
    );
};

export default RealEstateMetrics;