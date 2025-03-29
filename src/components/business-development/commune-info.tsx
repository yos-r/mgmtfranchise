import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users, Briefcase, Clock, HomeIcon, Building, Pin, MapPin, BarChart, PersonStanding } from 'lucide-react';
import { PersonIcon } from '@radix-ui/react-icons';

const CommuneInfo = () => {
  // Static data for commune
  const communeName = "Bordeaux Centre";
  const totalHouseholds = 13230;
  const dominantAgeGroup = "25-39 ans";
  const dominantHouseholdType = "Personnes vivant seules";
  const dominantOccupation = "Cadres";
  const youngPopulationPercentage = 51;

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="border-b py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Population </h2>
          </div>
          <div className="bg-[#beaf87]/20 p-2 rounded-full">
            <PersonIcon className="h-6 w-6 text-[#746649]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          {/* Households count */}
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-sm bg-gray-100 mb-2">
              <HomeIcon className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalHouseholds.toLocaleString('fr-FR')}</p>
            <p className="text-xs text-gray-500">Ménages</p>
          </div>

          {/* Household type */}
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-sm bg-[#beaf87]/20 mb-2">
              <Users className="h-6 w-6 text-[#746649]" />
            </div>
            <p className="text-xl font-bold text-gray-800 text-center">Personnes seules</p>
            <p className="text-xs text-gray-500 text-center">Type de ménage le plus représenté</p>
          </div>

          {/* Occupation */}
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-sm bg-gray-100 mb-2">
              <Briefcase className="h-6 w-6 text-gray-700" />
            </div>
            <p className="text-xl font-bold text-gray-800">{dominantOccupation}</p>
            <p className="text-xs text-center text-gray-500">Catégorie socio-professionnelle la plus représentée</p>
          </div>

          {/* Age group */}
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-sm bg-[#beaf87]/20 mb-2">
              <Clock className="h-6 w-6 text-[#746649]" />
            </div>
            <p className="text-xl font-bold text-gray-800">{dominantAgeGroup}</p>
            <p className="text-xs text-center text-gray-500">Tranche d'âge la plus représentée</p>
          </div>
        </div>

        
      </CardContent>
    </Card>
  );
};

export default CommuneInfo;