import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface DocumentPreviewProps {
  type: 'invoice' | 'email';
  invoice: {
    number: string;
    issueDate: Date;
    dueDate: Date;
    franchise: {
      name: string;
      company: string;
      address: string;
      taxId: string;
    };
    items: Array<{
      description: string;
      amount: number;
    }>;
    totalAmount: number;
    taxAmount: number;
  };
  emailContent?: string;
}

export function DocumentPreview({ type, invoice, emailContent }: DocumentPreviewProps) {
  if (type === 'email') {
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
              <div dangerouslySetInnerHTML={{ __html: emailContent || '' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white">
      <CardContent className="p-8 space-y-6">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">INVOICE</h1>
            <p className="body-1">Invoice Number: {invoice.number}</p>
            <p className="body-1">Issue Date: {format(invoice.issueDate, 'MMMM d, yyyy')}</p>
            <p className="body-1">Due Date: {format(invoice.dueDate, 'MMMM d, yyyy')}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold mb-2">CENTURY 21</h2>
            <p className="body-1">123 Corporate Drive</p>
            <p className="body-1">Paris, France 75001</p>
            <p className="body-1">contact@century21.fr</p>
          </div>
        </div>

        <div className="border-t border-b py-6 my-6">
          <h3 className="font-bold mb-2">Bill To:</h3>
          <p className="body-1">{invoice.franchise.name}</p>
          <p className="body-1">{invoice.franchise.company}</p>
          <p className="body-1">{invoice.franchise.address}</p>
          <p className="body-1">Tax ID: {invoice.franchise.taxId}</p>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 label-1">Description</th>
              <th className="text-right py-2 label-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 body-1">{item.description}</td>
                <td className="py-2 text-right numbers">€{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-b">
              <td className="py-2 label-1">Tax</td>
              <td className="py-2 text-right numbers">€{invoice.taxAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="py-2 font-bold label-1">Total Amount</td>
              <td className="py-2 text-right font-bold numbers">€{invoice.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-8 text-sm text-gray-600">
          <p className="legal">Payment Terms: Net 30</p>
          <p className="legal">Please include invoice number in payment reference</p>
        </div>
      </CardContent>
    </Card>
  );
}