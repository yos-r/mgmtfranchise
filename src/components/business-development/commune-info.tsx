import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users, Briefcase, Clock, Home, Building, Euro, PercentSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { PersonIcon } from '@radix-ui/react-icons';
import { Button } from "@/components/ui/button";

const CommuneInfo = ({area}) => {
  // Static data for commune
  const communeName = "Bordeaux Centre";
  const totalHouseholds = 13230;
  const dominantAgeGroup = "25-39 ans";
  const dominantHouseholdType = "Personnes vivant seules";
  const dominantOccupation = "Cadres";
  const employmentRate = "86%";
  const averageRevenue = "32 450€";

  // Define all stat cards
  const statCards = [
    {
      icon: <Home className="h-6 w-6 text-gray-600" />,
      value: area.individuals.toLocaleString('fr-FR'),
      label: "Ménages",
      bgColor: "bg-gray-100",

    },
    {
      icon: <Users className="h-6 w-6 text-[#746649]" />,
      value: "Personnes seules",
      label: "Type de ménage le plus représenté",
      bgColor: "bg-[#beaf87]/20",
      type: 'text'
    },
    {
      icon: <Briefcase className="h-6 w-6 text-gray-700" />,
      value: dominantOccupation,
      label: "Catégorie socio-professionnelle la plus représentée",
      bgColor: "bg-gray-100",
      type: 'text'

    },
    {
      icon: <Clock className="h-6 w-6 text-[#746649]" />,
      value: dominantAgeGroup,
      label: "Tranche d'âge la plus représentée",
      bgColor: "bg-[#beaf87]/20"
    },
    {
      icon: <PercentSquare className="h-6 w-6 text-gray-600" />,
      value: employmentRate,
      label: "Taux d'emploi",
      bgColor: "bg-gray-100"
    },
    {
      icon: <Euro className="h-6 w-6 text-[#746649]" />,
      value: averageRevenue,
      label: "Revenu moyen annuel",
      bgColor: "bg-[#beaf87]/20"
    }
  ];

  // State for tracking visible cards
  const [startIndex, setStartIndex] = useState(0);
  const visibleCards = 4; // Number of cards to show at once
  const totalCards = statCards.length;

  // Navigation functions
  const scrollLeft = () => {
    setStartIndex(prev => (prev - 1 + totalCards) % totalCards);
  };

  const scrollRight = () => {
    setStartIndex(prev => (prev + 1) % totalCards);
  };

  // Get current visible cards
  const currentCards = [];
  for (let i = 0; i < visibleCards; i++) {
    const index = (startIndex + i) % totalCards;
    currentCards.push(statCards[index]);
  }

  return (
    <Card className="w-full shadow-sm relative">
      <CardHeader className="border-b py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Population</h2>
          </div>

          <div className="flex gap-x-4 items-center">
            <div className="bg-[#beaf87]/20 p-2 rounded-lg flex gap-x-2 items-center text-sm font">
              <PersonIcon className="h-4 w-4 text-[#746649]" />
              <b>{area.population.toLocaleString('fr-FR')}</b> habitants
            </div>
            <div className='bg-gray-50/50 p-2 -mx-2 border rounded-lg -mb-2 -mt-2'>
              <img src="https://upload.wikimedia.org/wikipedia/fr/b/bc/Statbel_%28logo%29.svg" className='h-4' alt="Statbel" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {/* Card grid with animation - wrapped in relative container for positioning the arrows */}
        <div className="relative mt-6">
          {/* Left navigation button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full border-gray-200 absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 shadow-sm bg-white/90"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {/* Right navigation button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full border-gray-200 absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 shadow-sm bg-white/90"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-300 ease-in-out">
          {currentCards.map((card, index) => (
            <div className="flex flex-col items-center" key={`stat-${index}`}>
              <div className={`p-3 rounded-sm ${card.bgColor} mb-2`}>
                {card.icon}
              </div>
              {card.type=='text' && <p className="text-lg font-bold text-gray-800 text-center">{card.value}</p>}
              {card.type!='text' && <p className="text-xl font-bold text-gray-800 text-center">{card.value}</p>}

              <p className="text-xs text-gray-500 text-center">{card.label}</p>
            </div>
          ))}
        </div>
        </div>

        {/* Indicator dots */}
          {/* <div className="flex justify-center space-x-2 mt-6">
            {statCards.map((_, index) => {
              // Check if this card is currently visible
              const isVisible = Array.from({ length: visibleCards }).some(
                (_, i) => (startIndex + i) % totalCards === index
              );
              
              return (
                <div 
                  key={`indicator-${index}`} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isVisible ? 'w-4 bg-[#beaf87]' : 'w-1.5 bg-gray-300'
                  }`}
                />
              );
            })}
          </div> */}
      </CardContent>
    </Card>
  );
};

export default CommuneInfo;