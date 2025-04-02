import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Building, ChevronLeft, ChevronRight, 
  Download, History, House, X 
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

const RealEstateTransactions = () => {
  // Static data for transactions
  const apartmentTransactions = 8086;
  const houseTransactions = 1110;
  const city = "Vanves";
  const fromYear = 2014;

  // Sample transaction data
  const transactionData = [
    { id: 1, type: 'Apartment', price: '325,000€', date: '15/03/2025', area: '78m²' },
    { id: 2, type: 'House', price: '580,000€', date: '02/03/2025', area: '142m²' },
    { id: 3, type: 'Apartment', price: '298,000€', date: '28/02/2025', area: '65m²' },
    { id: 4, type: 'House', price: '625,000€', date: '15/02/2025', area: '165m²' },
    { id: 5, type: 'Apartment', price: '312,500€', date: '10/02/2025', area: '72m²' },
    { id: 6, type: 'Apartment', price: '245,000€', date: '05/02/2025', area: '54m²' },
    { id: 7, type: 'House', price: '495,000€', date: '28/01/2025', area: '128m²' },
    { id: 8, type: 'Apartment', price: '275,000€', date: '25/01/2025', area: '63m²' },
    { id: 9, type: 'House', price: '548,000€', date: '18/01/2025', area: '137m²' },
    { id: 10, type: 'Apartment', price: '330,000€', date: '12/01/2025', area: '82m²' },
    { id: 11, type: 'House', price: '605,000€', date: '05/01/2025', area: '155m²' },
    { id: 12, type: 'Apartment', price: '290,000€', date: '28/12/2024', area: '68m²' },
    { id: 13, type: 'Apartment', price: '315,000€', date: '22/12/2024', area: '75m²' },
    { id: 14, type: 'House', price: '575,000€', date: '15/12/2024', area: '145m²' },
  ];

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const transactionsPerPage = 4;
  const pageCount = Math.ceil(transactionData.length / transactionsPerPage);

  // State for export dialog
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Get current transactions
  const currentTransactions = transactionData.slice(
    currentPage * transactionsPerPage,
    (currentPage + 1) * transactionsPerPage
  );

  // Pagination handlers with dialog trigger
  const goToPreviousPage = () => {
    setCurrentPage(prevPage => Math.max(0, prevPage - 1));
  };

  const goToNextPage = () => {
    // Show export dialog when paginating to next page
    setShowExportDialog(true);
    
    // Optionally, still change the page
    setCurrentPage(prevPage => Math.min(pageCount - 1, prevPage + 1));
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Ventes immobilières réalisées</h2>
          <div className="flex items-center -mr-2 py-4 pb-0 text-gray-700  rounded-md transition-colors duration-200">
            <img
              src="https://finance.belgium.be/sites/all/themes/custom/finance/logo_en.png"
              className="h-7 -mt-6"
              title="Federal Public Service FINANCE"
            />
          </div>
        </div>
      </CardHeader>

      <Tabs defaultValue="overview" className="w-full">
        <div className="px-6 pt-3">
          <TabsList className="grid grid-cols-2 -mb-4 ">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="p-0">
          <CardContent className="p-0 pt-1">
            <div className="divide-y space-y-5 divide-gray-100">
              {/* Apartments section */}
              <div className="flex flex-col justify-between p-4 py-2 bg-[#252526]/10 rounded-lg shadow-sm h-36 m-6 mb-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-[#252526] bg-white bg-opacity-70 px-2 py-1 rounded-full">
                    Appartements - Ventes
                  </span>
                  <Building className="h-5 w-5 text-[#252526]" />
                </div>
                <div className="flex flex-col items-center -mt-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-0 text-center">Nombre de transactions d'appartements</h3>
                  <p className="text-5xl font-bold text-[#252526] pb-0">{apartmentTransactions}</p>
                </div>
                <div className="flex justify-center items-center space-x-1">
                  <History className="h-3 w-3 text-[#252526]" />
                  <span className="text-xs text-[#252526]">Depuis {fromYear}</span>
                </div>
              </div>

              {/* Houses section */}
              <div className="flex flex-col justify-between p-4 py-2 bg-relentlessgold/20 rounded-lg shadow-sm h-36 m-6 mt-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-[#252526] bg-white bg-opacity-70 px-2 py-1 rounded-full">
                    Maisons - Ventes
                  </span>
                  <House className="h-5 w-5 text-darkgold" />
                </div>
                <div className="flex flex-col items-center -mt-2">
                  <h3 className="text-sm font-medium text-darkgold mb-0 text-center">Nombre de transactions de maisons</h3>
                  <p className="text-5xl font-bold text-darkgold pb-0">{houseTransactions}</p>
                </div>
                <div className="flex justify-center items-center space-x-1">
                  <History className="h-3 w-3 text-darkgold" />
                  <span className="text-xs text-darkgold">Depuis {fromYear}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="transactions" className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-medium text-gray-700">
              Historique des transactions
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-3 text-xs flex items-center gap-1 text-gray-600 border-gray-300"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Exporter CSV
            </Button>
          </div>

          <div className="bg-white rounded-lg mt-2">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 pb-2 mb-2 border-b text-sm font-medium text-gray-500">
              <div>Type</div>
              <div>Prix</div>
              <div>Date</div>
              <div>Surface</div>
            </div>
              {currentTransactions.map((transaction) => (
                <div key={transaction.id} className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100 text-sm">
                  <div className="font-medium text-gray-800 flex items-center">
                    {transaction.type === 'Apartment' ? (
                      <span>Appartement</span>
                    ) : (
                      <span>Maison</span>
                    )}
                  </div>
                  <div className="font-bold text-gray-900">{transaction.price}</div>
                  <div className="text-gray-600">{transaction.date}</div>
                  <div className="text-gray-600">{transaction.area}</div>
                </div>
              ))}
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Page {currentPage + 1} sur {pageCount}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full"
                  onClick={goToNextPage}
                  disabled={currentPage === pageCount - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
      </Tabs>


      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="px-2">
            <DialogTitle className="text-lg font-semibold mb-1">Accès aux données</DialogTitle>
            <DialogDescription className="text-gray-600">
              Abonnez-vous pour accéder aux données complètes
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-3 bg-gray-50 rounded-lg my-2">
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-[#beaf87]/20 flex items-center justify-center">
                <Download className="h-5 w-5 text-[#beaf87]" />
              </div>
              <div>
                <h4 className="font-medium">Données complètes</h4>
                <p className="text-xs text-gray-500">Abonnez-vous pour télécharger toutes les transactions</p>
              </div>
            </div>
            
            <div className="flex items-center mt-4">
              <Button className="w-full bg-[#beaf87] hover:bg-[#a39775] text-white">
                S'abonner pour accéder
              </Button>
            </div>
          </div>
          
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RealEstateTransactions;