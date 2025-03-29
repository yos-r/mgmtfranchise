import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BarChart2, Building, History, Home, House, Info } from 'lucide-react';

const RealEstateTransactions = () => {
  // Static data for transactions
  const apartmentTransactions = 3833;
  const houseTransactions = 290;
  const city = "Vanves";
  const fromYear = 2014;

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className=" border-b pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Ventes immobilières réalisées (DVF)</h2>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#beaf87]/50 text-[#746649]">IBSA</span>
        </div>

      </CardHeader>


      <CardContent className="p-0">

        <div className="divide-y divide-gray-100">
          {/* Apartments section */}
          <div className="flex flex-col justify-between p-4  bg-[#252526]/10 rounded-lg shadow-sm h-40 m-6">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-[#252526] bg-white bg-opacity-70 px-2 py-1 rounded-full">
                Appartements - Ventes
              </span>
              <Building className="h-5 w-5 text-[#252526]" />
            </div>
            <div className="flex flex-col items-center mt-2">
              <h3 className="text-sm font-medium text-gray-700 mb-1  text-center">Nombre de transactions d'appartments</h3>
              <p className="text-5xl font-bold text-[#252526] pb-3">234</p>
            </div>
            <div className="mt- flex justify-center items-center space-x-1 ">
              <History className="h-3 w-3 text-[#252526]" />
              <span className="text-xs text-[#252526]">Depuis 2014</span>
            </div>
          </div>
          <div className="flex flex-col justify-between p-4  bg-relentlessgold/20 rounded-lg shadow-sm h-40 m-6">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-[#252526] bg-white bg-opacity-70 px-2 py-1 rounded-full">
                Maisons - Ventes
              </span>
              <House className="h-5 w-5 text-darkgold" />
            </div>
            <div className="flex flex-col items-center mt-2">
              <h3 className="text-sm font-medium text-darkgold mb-1  text-center">Nombre de transactions de maisons</h3>
              <p className="text-5xl font-bold text-darkgold pb-3">2234</p>
            </div>
            <div className="mt- flex justify-center items-center space-x-1 ">
              <History className="h-3 w-3 text-darkgold" />
              <span className="text-xs text-darkgold">Depuis 2014</span>
            </div>
          </div>

          {/* <div className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Building className="h-6 w-6 text-gray-800" />
              <h3 className="text-xl font-semibold text-gray-800">Appartements - Ventes</h3>
            </div>

            <div className="mt-4">
              <p className="text-5xl font-bold text-gray-900">{apartmentTransactions.toLocaleString('fr-FR')}</p>
              <p className="mt-2 text-gray-500">
                Nombre de transactions d'appartements depuis {fromYear}
              </p>
            </div>
          </div> */}

          {/* Houses section
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Home className="h-6 w-6 text-gray-800" />
              <h3 className="text-xl font-semibold text-gray-800">Maisons - Ventes</h3>
            </div>
            
            <div className="mt-4">
              <p className="text-5xl font-bold text-gray-900">{houseTransactions.toLocaleString('fr-FR')}</p>
              <p className="mt-2 text-gray-500">
                Nombre de transactions de maisons depuis {fromYear}
              </p>
            </div>
          </div> */}
        </div>

        {/* <div className="p-6 pt-2 text-gray-600">
          À {city}, il y a eu {apartmentTransactions.toLocaleString('fr-FR')} appartements vendus et {houseTransactions.toLocaleString('fr-FR')} maisons vendues depuis {fromYear}.
        </div> */}
      </CardContent>
    </Card>
  );
};

export default RealEstateTransactions;