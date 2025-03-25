import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface EmailPreviewProps {
  invoice: {
    number: string;
    dueDate: Date;
    totalAmount: number;
    franchise: {
      name: string;
    };
  };
  emailContent: string;
}

export function EmailPreview({ invoice, emailContent }: EmailPreviewProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="label-1">To:</p>
            <p className="body-1">{invoice.franchise.name}</p>
          </div>
          <div className="flex justify-between">
            <p className="label-1">Subject:</p>
            <p className="body-1">Invoice {invoice.number} - Due {format(invoice.dueDate, 'MMMM d, yyyy')}</p>
          </div>
        </div>
        <div className="border-t pt-4">
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: emailContent }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}