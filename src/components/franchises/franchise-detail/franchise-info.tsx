import { Building, Mail, Phone, FileText, Download, User, ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function FranchiseInfo({ franchise }: any) {
  console.log('the contracts are', franchise.franchise_contracts)
  const [contractDetailsVisible, setContractDetailsVisible] = useState<{[key: number]: boolean}>({});


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
      <div key={index} className="space-y-2">
        <div className="flex items-center justify-between">
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
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="button-2"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Toggle logic for showing/hiding details
                const newDetailsState = { ...contractDetailsVisible };
                newDetailsState[index] = !newDetailsState[index];
                setContractDetailsVisible(newDetailsState);
              }}
            >
              {contractDetailsVisible[index] ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>
        </div>
        
        {contractDetailsVisible[index] && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durée du contrat</span>
              <span>{doc.duration_years} ans</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Redevance mensuelle</span>
              <span>{doc.royalty_amount.toLocaleString()} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant marketing</span>
              <span>{doc.marketing_amount.toLocaleString()} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Augmentation annuelle</span>
              <span>{doc.annual_increase}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Période de grâce</span>
              <span>{doc.grace_period_months} mois</span>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
</CardContent>
      </Card>
    </div>
  );
}