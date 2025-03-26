import { Building, Mail, Phone, FileText, Download, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function FranchiseInfo({ franchise }: any) {
  console.log('the contracts are', franchise.franchise_contracts)


  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-1">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="label-1">Company Information</span>
              </div>
              <div className="space-y-1">
                <p className="body-1 text-muted-foreground">
                  <span className="font-medium">Company Name:</span> {franchise.company_name}
                </p>
                <p className="body-1 text-muted-foreground">
                  <span className="font-medium">Tax ID:</span> {franchise.tax_id}
                </p>
                <p className="body-1 text-muted-foreground">
                  <span className="font-medium">Address:</span> {franchise.address}
                </p>
              </div>
            </div>
            {/* <div className="space-y-2">
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
            </div> */}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="tagline-2">Franchisé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <User className="h-16 w-16 rounded-full border object-cover mr-3" />
            
            <div>
              <h3 className="body-1 font-medium">{franchise.owner_name}</h3>
              <div className="space-y-1 mt-2">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="body-1">owner@century21.be</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="body-1">+32456487</span>
                </div>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
      <Card className="col-span-1">
      <CardHeader>
          <CardTitle className="tagline-2">Contrats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="space-y-4">
          {franchise.franchise_contracts.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="body-1">
                  {new Date(doc.start_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="button-2"
              >
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