import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TicketSubmittedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect after 5 seconds
    const timeout = setTimeout(() => {
      navigate('/submit-ticket');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-semibold">CENTURY 21</h2>
          </div>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Ticket Submitted Successfully</CardTitle>
          <CardDescription>
            Thank you for contacting us. Our support team will review your ticket and get back to you soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You will receive a confirmation email with your ticket details.
          </p>
          <Button
            className="w-full"
            onClick={() => navigate('/submit-ticket')}
          >
            Submit Another Ticket
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}