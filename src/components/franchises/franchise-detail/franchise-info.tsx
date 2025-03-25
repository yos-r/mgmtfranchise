import { Building, Euro, Mail, Phone, MapPin, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function FranchiseInfo() {
  const franchise = {
    owner: {
      name: "Marie Laurent",
      email: "marie.laurent@century21.fr",
      phone: "+33 1 42 86 00 00",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
    },
    company: {
      name: "Saint-Germain Real Estate SARL",
      taxId: "FR 12 345 678 901",
      royaltyAmount: 2500,
      marketingAmount: 1500,
      annualIncrease: 3,
    },
    address: "123 Boulevard Saint-Germain, 75006 Paris, France",
    contract: {
      signDate: "2020-06-15",
      expirationDate: "2025-06-14",
      documents: [
        { name: "Franchise Agreement", type: "PDF" },
        { name: "Operations Manual", type: "PDF" },
        { name: "Brand Guidelines", type: "PDF" }
      ]
    }
  };

  const daysUntilExpiration = Math.ceil(
    (new Date(franchise.contract.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-2">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="label-1">Company Information</span>
              </div>
              <div className="space-y-1">
                <p className="body-1 text-muted-foreground">
                  <span className="font-medium">Company Name:</span> {franchise.company.name}
                </p>
                <p className="body-1 text-muted-foreground">
                  <span className="font-medium">Tax ID:</span> {franchise.company.taxId}
                </p>
                <p className="body-1 text-muted-foreground">
                  <span className="font-medium">Address:</span> {franchise.address}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-muted-foreground" />
                <span className="label-1">Financial Details</span>
              </div>
              <div className="space-y-1">
                <p className="body-1 text-muted-foreground">
                  <span className="font-medium">Monthly Royalty:</span> €{franchise.company.royaltyAmount}
                </p>
                <p className="body-1 text-muted-foreground">
                  <span className="font-medium">Marketing Contribution:</span> €{franchise.company.marketingAmount}
                </p>
                <p className="body-1 text-muted-foreground">
                  <span className="font-medium">Annual Increase:</span> {franchise.company.annualIncrease}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="tagline-2">Franchise Owner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <img
              src={franchise.owner.image}
              alt={franchise.owner.name}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <h3 className="body-1 font-medium">{franchise.owner.name}</h3>
              <div className="space-y-1 mt-2">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="body-1">{franchise.owner.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="body-1">{franchise.owner.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="label-1">Documents</h4>
            {franchise.contract.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="body-1">{doc.name}</span>
                </div>
                <Button variant="ghost" size="sm" className="button-2">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}