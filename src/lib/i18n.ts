export const translations = {
  en: {
    overview: "Overview",
    franchises: "Franchises",
    royalties: "Royalties",
    performance: "Performance",
    training: "Training",
    support: "Support",
    totalFranchises: "Total Franchises",
    monthlyRevenue: "Monthly Revenue",
    topPerformers: "Top Performers",
    activeSupport: "Active Support Tickets",
    fromLastMonth: "from last month",
    exceededTargets: "Exceeded targets this quarter",
    resolutionRate: "resolution rate",
    revenueOverview: "Revenue Overview",
    topRegions: "Top Performing Regions",
    franchiseNetwork: "Franchise Network",
    newFranchise: "New Franchise",
    viewDetails: "View Details",
    topAgents: "Top Agents",
    addFranchise: "Add Franchise",
  },
  fr: {
    overview: "Vue d'ensemble",
    franchises: "Franchises",
    royalties: "Redevances",
    performance: "Performance",
    training: "Formation",
    support: "Support",
    totalFranchises: "Total des Franchises",
    monthlyRevenue: "Revenu Mensuel",
    topPerformers: "Meilleurs Performants",
    activeSupport: "Tickets de Support Actifs",
    fromLastMonth: "depuis le mois dernier",
    exceededTargets: "Ont dépassé les objectifs ce trimestre",
    resolutionRate: "taux de résolution",
    revenueOverview: "Aperçu des Revenus",
    topRegions: "Meilleures Régions",
    franchiseNetwork: "Réseau de Franchises",
    newFranchise: "Nouvelle Franchise",
    viewDetails: "Voir les Détails",
    topAgents: "Meilleurs Agents",
    addFranchise: "Ajouter Une Franchise",
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, lang: Language = 'fr'): string {
  return translations[lang][key];
}