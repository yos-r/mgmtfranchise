// VisitSummary.jsx
import { useState, useEffect } from "react";
import {
  ClipboardList,
  Plus,
  MoreHorizontal,
  Image,
  Badge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "completed":
      return "bg-green-300 text-green-800";
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "pending":
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const getConformityColor = (score) => {
  if (score >= 80) return "bg-green-700";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

export default function VisitSummary({ franchise, assistance, actions }) {
  const [conformity, setConformity] = useState(assistance?.conformity || 0);

  // Update local state if assistance prop changes
  useEffect(() => {
    if (assistance?.conformity !== undefined) {
      setConformity(assistance.conformity);
    }
  }, [assistance]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Résumé de l'assistance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 capitalize">
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="text-sm font-medium">Durée</span>
            <span className="text-sm">{assistance.duration}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="text-sm font-medium">Type</span>
            <span className="text-sm">{assistance.type.replace("_", " ")}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="text-sm font-medium">Statut</span>
            <span className="text-sm font-medium">{assistance.status}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Conformité globale</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2.5">
                <div
                  className={`${getConformityColor(conformity)} h-2.5 rounded-full transition-all duration-300`}
                  style={{ width: `${conformity || 0}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm">{conformity || 0}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}