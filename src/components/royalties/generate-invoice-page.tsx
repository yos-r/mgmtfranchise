import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Save, Send, Eye, Mail, FileText } from "lucide-react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DocumentPreview } from "./document-preview";

interface GenerateInvoicePageProps {
  payment: any;
  onBack: () => void;
  onSave: (invoice: any) => void;
  onSaveAndSend: (invoice: any, email: string) => void;
}

export function GenerateInvoicePage({ payment, onBack, onSave, onSaveAndSend }: GenerateInvoicePageProps) {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("edit");
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${format(new Date(), 'yyyyMMdd')}-001`);
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(payment.dueDate, 'yyyy-MM-dd'));

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: `
      <p>Dear ${payment.franchiseName},</p>
      <p>Please find attached invoice ${invoiceNumber} for your monthly royalty payment.</p>
      <p>Invoice Details:</p>
      <ul>
        <li>Invoice Number: ${invoiceNumber}</li>
        <li>Amount: €${payment.totalAmount.toLocaleString()}</li>
        <li>Due Date: ${format(new Date(dueDate), 'MMMM d, yyyy')}</li>
      </ul>
      <p>Please ensure payment is made by the due date. If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>CENTURY 21 Management</p>
    `,
  });

  const invoice = {
    number: invoiceNumber,
    issueDate: new Date(issueDate),
    dueDate: new Date(dueDate),
    franchise: {
      name: payment.franchiseName,
      company: payment.companyName,
      address: "123 Example Street, Paris",
      taxId: "FR 12345678901",
    },
    items: [
      {
        description: "Monthly Royalty Fee",
        amount: payment.totalAmount * 0.7,
      },
      {
        description: "Marketing Contribution",
        amount: payment.totalAmount * 0.3,
      },
    ],
    totalAmount: payment.totalAmount,
    taxAmount: 1.00,
  };

  const handleSave = () => {
    onSave(invoice);
    toast({
      title: "Invoice saved",
      description: "The invoice has been saved as a draft",
    });
  };

  const handleSaveAndSend = () => {
    onSaveAndSend(invoice, editor?.getHTML() || '');
    toast({
      title: "Invoice sent",
      description: "The invoice has been saved and sent to the franchise",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="button-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payments
          </Button>
          <div>
            <h2 className="tagline-1">Generate Invoice</h2>
            <p className="body-lead text-muted-foreground">
              Create and send invoice for {payment.franchiseName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleSave} className="button-1">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={handleSaveAndSend} className="button-1">
            <Send className="mr-2 h-4 w-4" />
            Save & Send
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-number" className="label-1">Invoice Number</Label>
                    <Input
                      id="invoice-number"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="body-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issue-date" className="label-1">Issue Date</Label>
                    <Input
                      id="issue-date"
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="body-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due-date" className="label-1">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="body-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit" className="button-2">
                    <FileText className="mr-2 h-4 w-4" />
                    Invoice
                  </TabsTrigger>
                  <TabsTrigger value="email" className="button-2">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="mt-4">
                  <div className="space-y-2">
                    <Label className="label-1">Preview</Label>
                    <Button
                      variant="outline"
                      className="w-full h-[400px] flex flex-col items-center justify-center"
                      onClick={() => setCurrentTab("preview")}
                    >
                      <Eye className="h-8 w-8 mb-2" />
                      <span className="body-1">Click to preview invoice</span>
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="email" className="mt-4">
                  <div className="space-y-2">
                    <Label className="label-1">Email Content</Label>
                    <div className="min-h-[400px] border rounded-md p-4">
                      <EditorContent editor={editor} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="invoice">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="invoice" className="button-2">
                    <FileText className="mr-2 h-4 w-4" />
                    Invoice Preview
                  </TabsTrigger>
                  <TabsTrigger value="email" className="button-2">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Preview
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="invoice" className="mt-4">
                  <DocumentPreview type="invoice" invoice={invoice} />
                </TabsContent>
                <TabsContent value="email" className="mt-4">
                  <DocumentPreview 
                    type="email" 
                    invoice={invoice} 
                    emailContent={editor?.getHTML()}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}