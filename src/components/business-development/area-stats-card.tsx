import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Building2, Users, Percent, MapPin, ChartBar, BarChart, House, HousePlugIcon, HousePlusIcon, MapPinHouse } from 'lucide-react';

const AreaStatsCard = ({ area,areaName = "Quartier Centre", totalAgencies, population, marketShare = "25%" }) => {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="border-b py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Marché </h2>
          </div>
          <div className="bg-[#beaf87]/20 p-2 rounded-lg">
            <BarChart className="h-5 w-5 text-[#746649]" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
          {/* nombre de biens stat */}
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-sm  bg-gray-100 mb-2">
              <MapPinHouse className="h-6 w-6 text-obsessedgrey" />
              {/* <MapPinHouse></MapPinHouse> */}
            </div>
            <p className="text-2xl font-bold text-gray-800">{area.listingsForSale+area.listingsForRent}</p>
            <p className="text-xs text-gray-500 text-center">Biens <br /> disponibles</p>
          </div>
            {/* Population stat */}
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-sm bg-[#beaf87]/20 mb-2">
              <House className="h-6 w-6 text-[#746649]" />
              
            </div>
            <p className="text-2xl font-bold text-gray-800">€{area.avgSquareMeter.toLocaleString('en-US')}</p>
            <p className="text-xs text-gray-500 text-center">Prix moyen du <br />mètre carré 2024</p>
            <p className="text-xs font-semibold text-green-700 text-center">+2% depuis 2023 </p>

          </div>
          {/* Agencies stat */}
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-sm bg-gray-100 mb-2">
              <Building2 className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{area.totalAgencies}</p>
            <p className="text-xs text-gray-500 text-center"> Agences <br /> actives</p>
          </div>
          
          
          
          {/* Market share stat */}
          <div className="flex flex-col items-center">
            <div className="p-2 rounded-sm bg-gray-100 mb-2">
              {/* <Percent className="h-6 w-6 text-gray-600" /> */}
              <img className="h-8 w-" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Century_21_seal_2018.svg/470px-Century_21_seal_2018.svg.png?20180306135049" ></img>
            </div>
            <p className="text-2xl font-bold text-gray-800">{area.c21agencies} </p>
            <p className="text-xs text-gray-500 text-center">Agences <br />CENTURY 21</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AreaStatsCard;