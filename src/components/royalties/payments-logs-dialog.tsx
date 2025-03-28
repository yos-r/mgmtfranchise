import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/auth";
import { User, History, Edit, Receipt, Check, Clock, AlertTriangle } from "lucide-react";

interface PaymentLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string | undefined;
}

interface PaymentLog {
  id: string;
  created_at: string;
  payment_id: string;
  user_id: string;
  action: string;
  details: any;
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

export function PaymentLogsDialog({
  open,
  onOpenChange,
  paymentId
}: PaymentLogsDialogProps) {
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLogs = async () => {
    if (!paymentId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_logs')
        .select('*, profiles(full_name, email)')
        .eq('payment_id', paymentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setLogs(data);
      }
    } catch (error) {
      console.error("Error loading payment logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && paymentId) {
      loadLogs();
    }
  }, [open, paymentId]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'payment_recorded':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'payment_edited':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'payment_created':
        return <Receipt className="h-4 w-4 text-purple-500" />;
      case 'status_changed':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'payment_voided':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatActionText = (action: string) => {
    switch (action) {
      case 'payment_recorded':
        return 'Payment Recorded';
      case 'payment_edited':
        return 'Payment Edited';
      case 'payment_created':
        return 'Payment Created';
      case 'status_changed':
        return 'Status Changed';
      case 'payment_voided':
        return 'Payment Voided';
      default:
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatLogDetails = (log: PaymentLog) => {
    if (!log.details) return null;
    
    try {
      const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
      
      const formatChanges = () => {
        if (!details.changes) return null;
        
        return (
          <div className="mt-2 space-y-1 text-sm">
            {Object.entries(details.changes).map(([field, values]: [string, any]) => (
              <div key={field} className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">{field.replace(/_/g, ' ')}:</span>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="line-through text-red-500">{values.old || '-'}</span>
                  <span className="text-green-500">→ {values.new || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        );
      };
      
      if (log.action === 'status_changed') {
        return (
          <div className="mt-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-gray-100">
                {details.old_status || 'unknown'}
              </Badge>
              {' → '}
              <Badge
                className={
                  details.new_status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : details.new_status === 'late'
                    ? 'bg-red-100 text-red-800'
                    : details.new_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100'
                }
              >
                {details.new_status || 'unknown'}
              </Badge>
            </div>
            {details.note && <p className="mt-1">{details.note}</p>}
          </div>
        );
      }
      
      if (log.action === 'payment_recorded') {
        return (
          <div className="mt-2 space-y-1 text-sm">
            {details.amount && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Amount:</span>
                <span>€{parseFloat(details.amount).toLocaleString()}</span>
              </div>
            )}
            {details.payment_method && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Method:</span>
                <span>{details.payment_method}</span>
              </div>
            )}
            {details.payment_date && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Date:</span>
                <span>{format(new Date(details.payment_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            {details.payment_reference && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Reference:</span>
                <span>{details.payment_reference}</span>
              </div>
            )}
            {details.note && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Note:</span>
                <span>{details.note}</span>
              </div>
            )}
          </div>
        );
      }
      
      if (log.action === 'payment_edited') {
        return formatChanges();
      }
      
      // Default rendering for other actions
      return (
        <div className="mt-2 text-sm">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      );
    } catch (e) {
      console.error("Error formatting log details:", e);
      return <span className="text-xs text-muted-foreground">Error displaying log details</span>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Payment History Logs
          </DialogTitle>
          <DialogDescription>
            View all actions and changes made to this payment
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 p-3 border rounded-md">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full mt-1" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No history logs found for this payment
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="p-3 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="font-medium">{formatActionText(log.action)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                  
                  {/* User info */}
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>
                      {log.profiles?.full_name || log.profiles?.email || 'Unknown user'}
                    </span>
                  </div>
                  
                  {/* Log details */}
                  {formatLogDetails(log)}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}