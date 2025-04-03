import {
    ClipboardList,
    Plus,
    MoreHorizontal,
    Image,
    Badge} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
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
export default function VisitSummary({
    franchise,assistance,actions
}: any) {
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
                          <span className="text-sm">{assistance.type.replace('_',' ')}</span>

                          {/* <Badge variant="outline">{assistance.type}</Badge> */}
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-sm font-medium">Statut</span>
                          <span className="text-sm font-medium">{assistance.status}</span>

                          {/* <Badge className={getStatusBadgeClass(assistance.status)}> */}
                            
                          {/* </Badge> */}
                        </div>
                        {/* <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-sm font-medium">Actions</span>
                          <span className="text-sm">{actions.length}</span>
                        </div> */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Conformité globale</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-500 h-2.5 rounded-full" 
                                style={{ width: "85%" }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm">85%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
    )
}