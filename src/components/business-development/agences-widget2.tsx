import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Card } from '../ui/card';
import immowebLogo from '../../public/immoweb.png';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

const AgencesWidget2 = (area) => {
    // Use the currency formatting hook
    const { formatCurrency } = useCurrency();

    // Fictional agency data with revenue values
    const agencesData = [
        { nom: "ERA Châtelain", vente: 77, location: 41, revenuVente: 380000, revenuLocation: 124000, logo: "https://www.ixelles.city/_custom_storage/shop_logos/shop_logo_339__20240509_69786_m.png.webp" },
        { nom: "CENTURY 21 Boondael", vente: 51, location: 5, revenuVente: 310000, revenuLocation: 108000, logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ03IE1TnH8u5GAi-6nSd3XrFedfgbX6Q0Y6w&s"},
        { nom: "CENTURY 21 Molière", vente: 21, location: 1, revenuVente: 310000, revenuLocation: 108000, logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL_AXvvwnqjebOj5sjNocHIC9ygZ53_u2k3w&s" },
        { nom: "RE/MAX Premium", vente: 21, location: 0, revenuVente: 310000, revenuLocation: 108000, logo:"https://api-image.immovlan.be/v1/prouser/VLAN96139233/logo/French/webp/Small" },
        { nom: "Oralis Real Estate", vente: 70, location: 58, revenuVente: 420000, revenuLocation: 112000, logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCC4PRSYIAg0gLPkVfL6_dJvaJVLBv4sKRPA&s" },
        { nom: "We Invest", vente: 7, location: 8, revenuVente: 290000, revenuLocation: 76000, logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq52KwqYzPnJ0_Xzv2J7H3rjWWCG-tbqeCqA&s" },
        // { nom: "Engel & Völkers", vente: 65, location: 30, revenuVente: 450000, revenuLocation: 140000, logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9Q1XcqJRNEXMtah_qNJJV7Ndkl0Mf3mKaBA&s" },
        // { nom: "Barnes", vente: 48, location: 25, revenuVente: 480000, revenuLocation: 160000, logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDUH2VZYq-Y98gfzHfYTAo60h5JwBF9uD0_g&s" },
        // { nom: "La Propriété", vente: 42, location: 18, revenuVente: 350000, revenuLocation: 100000, logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDj9KuUAKZeMgPt9MYSA4axV6WQNgYkYeAFQ&s" },
        // { nom: "Trevi", vente: 38, location: 22, revenuVente: 340000, revenuLocation: 110000, logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdg14SjhZFVT9vIHFiDpNnALB9ZUm2LmzPMQ&s" }
    ];

    // Add total and calculate percentages for ratios
    const dataWithRatios = agencesData.map(agency => {
        const totalVolume = agency.vente + agency.location;
        const totalRevenue = agency.revenuVente + agency.revenuLocation;

        return {
            ...agency,
            // For volume metrics
            total: totalVolume,
            ventePercent: (agency.vente / totalVolume) * 100,
            locationPercent: (agency.location / totalVolume) * 100,

            // For revenue metrics
            revenuTotal: totalRevenue,
            revenuVentePercent: (agency.revenuVente / totalRevenue) * 100,
            revenuLocationPercent: (agency.revenuLocation / totalRevenue) * 100
        };
    }).sort((a, b) => b.total - a.total);

    // State for view mode
    const [viewMode, setViewMode] = useState('volume'); // 'volume' or 'revenue'

    // State for pagination
    const [currentPage, setCurrentPage] = useState(0);
    const agenciesPerPage = 5;
    const pageCount = Math.ceil(dataWithRatios.length / agenciesPerPage);

    // Get current agencies
    const currentAgencies = dataWithRatios.slice(
        currentPage * agenciesPerPage,
        (currentPage + 1) * agenciesPerPage
    );

    // Pagination handlers
    const goToPreviousPage = () => {
        setCurrentPage(prevPage => Math.max(0, prevPage - 1));
    };

    const goToNextPage = () => {
        setCurrentPage(prevPage => Math.min(pageCount - 1, prevPage + 1));
    };

    // State for export dialog
    const [showExportDialog, setShowExportDialog] = useState(false);
    // State for pagination dialog
    const [showPaginationDialog, setShowPaginationDialog] = useState(false);

    // Colors - using consistent color scheme for both visualizations
    const venteColor = "#beaf87"; // Indigo
    const locationColor = "#1f1f2f"; // Sky

    // Get data keys based on view mode
    const getDataKeys = () => {
        if (viewMode === 'volume') {
            return {
                ventePct: 'ventePercent',
                locationPct: 'locationPercent',
                venteVal: 'vente',
                locationVal: 'location',
                totalVal: 'total',
                label1: 'Biens en vente',
                label2: 'Biens en location'
            };
        } else {
            return {
                ventePct: 'revenuVentePercent',
                locationPct: 'revenuLocationPercent',
                venteVal: 'revenuVente',
                locationVal: 'revenuLocation',
                totalVal: 'revenuTotal',
                label1: 'Revenus des ventes',
                label2: 'Revenus des locations'
            };
        }
    };

    const { ventePct, locationPct, venteVal, locationVal, totalVal, label1, label2 } = getDataKeys();

    // Format percentage
    const formatPercentage = (value) => {
        return `${Math.round(value)}%`;
    };

    // Custom tooltip for the charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const isRevenue = viewMode === 'revenue';
            const agency = dataWithRatios.find(a => a.nom === label);

            if (!agency) return null;

            const venteValue = agency[venteVal];
            const locationValue = agency[locationVal];
            const ventePctValue = agency[ventePct];
            const locationPctValue = agency[locationPct];

            return (
                <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
                    <p className="font-bold text-gray-800">{label}</p>
                    <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: venteColor }}></div>
                            <p className="text-sm">
                                {label1}: <span className="font-medium">
                                    {isRevenue ? formatCurrency(venteValue) : venteValue}
                                </span> <span className="text-gray-500 ml-1">({formatPercentage(ventePctValue)})</span>
                            </p>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: locationColor }}></div>
                            <p className="text-sm">
                                {label2}: <span className="font-medium">
                                    {isRevenue ? formatCurrency(locationValue) : locationValue}
                                </span> <span className="text-gray-500 ml-1">({formatPercentage(locationPctValue)})</span>
                            </p>
                        </div>
                        <div className="mt-1 pt-1 border-t border-gray-200">
                            <p className="text-sm font-medium">
                                Total: <span className="font-bold">
                                    {isRevenue ? formatCurrency(agency[totalVal]) : agency[totalVal]}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <div className="bg-white p-6 rounded-xl shadow-xl w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Les agences immobilières et le marché</h2>
                        <p className="text-gray-500"><b>92 </b>agences immobilières pour <b>564</b> biens en vente et <b>336</b> biens en location</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-blue-800 text-sm font-medium -mx-3 mt-1 -p rounded-lg flex gap-x-1 items-center">
                            <img src={immowebLogo} className="h-6 inline rounded-sm" alt="Immoweb" />
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-3 text-xs flex items-center gap-1 text-gray-600 border-gray-300"
                            onClick={() => setShowExportDialog(true)}
                        >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Exporter CSV
                        </Button>
                        {/* <Select value={viewMode} onValueChange={setViewMode}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Mode d'affichage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="volume">Nombre de biens</SelectItem>
                                <SelectItem value="revenue">Revenus</SelectItem>
                            </SelectContent>
                        </Select> */}
                    </div>
                </div>
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Right side: Table with consistent styling */}
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agence</th>
                                    {viewMode === 'volume' ? (
                                        <>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vente (%)</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Location (%)</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Biens</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Market Share (%)</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rev. Vente (%)</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rev. Location (%)</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenus</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentAgencies.map((agence, index) => (
                                    <tr
                                        key={agence.nom}
                                        className={`hover:bg-gray-50 transition-colors ${index === 0 && currentPage === 0 ? 'bg-relentlessgold/20' : ''}`}
                                    >
                                        <td className="py-3 px-4 text-gray-800 font-medium">
                                            <div className="flex items-center">
                                                <img src={agence.logo} className='w-12 rounded-sm inline mr-4' alt={agence.nom} />
                                                {index === 0 && currentPage === 0 && (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full text-xs font-bold" style={{ backgroundColor: `${venteColor}80`, color: 'white' }}>1</span>
                                                )}
                                                {agence.nom}
                                            </div>
                                        </td>
                                        {viewMode === 'volume' ? (
                                            <>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <span className="font-medium text-gray-800">{Math.round(agence.ventePercent)}%</span>
                                                        <span className="text-gray-500 ml-2">({agence.vente})</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <span className="font-medium text-gray-800">{Math.round(agence.locationPercent)}%</span>
                                                        <span className="text-gray-500 ml-2">({agence.location})</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center text-gray-800 font-bold">{agence.total}</td>
                                                <td className="py-3 px-4 text-center text-gray-800 font-bold">{Math.floor(agence.total / 1363 * 100)}%</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <span className="font-medium text-gray-800">{Math.round(agence.revenuVentePercent)}%</span>
                                                        <span className="text-gray-500 ml-2">({formatCurrency(agence.revenuVente)})</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <span className="font-medium text-gray-800">{Math.round(agence.revenuLocationPercent)}%</span>
                                                        <span className="text-gray-500 ml-2">({formatCurrency(agence.revenuLocation)})</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center text-gray-800 font-bold">{formatCurrency(agence.revenuTotal)}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Left side: Horizontal bars with consistent styling */}
                    <div className="rounded-lg border border-gray-200 p-4 bg-white">
                        <div className="space-y-3">
                            {currentAgencies.map((agence, index) => {
                                const ventePctValue = agence[ventePct];
                                const locationPctValue = agence[locationPct];
                                return (
                                    <div key={`ratio-${agence.nom}`} className="flex flex-col">
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span className="font-medium">{agence.nom}</span>
                                            <span>{formatPercentage(ventePctValue)} / {formatPercentage(locationPctValue)}</span>
                                        </div>
                                        <div className="h-7 w-full bg-gray-100 rounded-md overflow-hidden flex">
                                            <div
                                                className="h-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                                                style={{ width: `${ventePctValue}%`, backgroundColor: venteColor }}
                                            >
                                                {ventePctValue > 15 && 'Vente'}
                                            </div>
                                            <div
                                                className="h-full flex items-center justify-start pl-2 text-xs text-white font-medium"
                                                style={{ width: `${locationPctValue}%`, backgroundColor: locationColor }}
                                            >
                                                {locationPctValue > 15 && 'Location'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Pagination controls underneath the bar chart */}
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
                                    onClick={() => {
                                        if (currentPage === pageCount - 2) {
                                            setShowPaginationDialog(true);
                                        } else {
                                            goToNextPage();
                                        }
                                    }}
                                    disabled={false}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
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
            
            {/* Pagination Dialog - shown when trying to go beyond last page */}
            <Dialog open={showPaginationDialog} onOpenChange={setShowPaginationDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="px-2">
                        <DialogTitle className="text-lg font-semibold mb-1">Accès aux données</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Découvrez plus d'agences et d'analyses avec l'accès premium
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="p-3 bg-gray-50 rounded-lg my-2">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="h-10 w-10 rounded-full bg-[#beaf87]/20 flex items-center justify-center">
                                <ChevronRight className="h-5 w-5 text-[#beaf87]" />
                            </div>
                            <div>
                                <h4 className="font-medium">Données étendues</h4>
                                <p className="text-xs text-gray-500">Accédez à toutes les agences dans votre région</p>
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

export default AgencesWidget2;