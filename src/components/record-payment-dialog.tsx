import { useState } from "react";
import { CalendarIcon, Receipt } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function RecordPaymentDialog() {
  const [date, setDate] = useState<Date>();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="button-1">
          <Receipt className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="tagline-2">Record Royalty Payment</DialogTitle>
          <DialogDescription className="body-lead">
            Enter the payment details for the franchise royalty.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="franchise" className="label-1">
              Franchise
            </Label>
            <Select>
              <SelectTrigger className="body-1">
                <SelectValue placeholder="Select franchise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saint-germain" className="body-1">CENTURY 21 Saint-Germain</SelectItem>
                <SelectItem value="confluence" className="body-1">CENTURY 21 Confluence</SelectItem>
                <SelectItem value="vieux-port" className="body-1">CENTURY 21 Vieux Port</SelectItem>
                <SelectItem value="bordeaux" className="body-1">CENTURY 21 Bordeaux Centre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount" className="label-1">
              Amount
            </Label>
            <Input
              id="amount"
              placeholder="€0.00"
              className="body-1"
            />
          </div>
          <div className="grid gap-2">
            <Label className="label-1">Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="body-1 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reference" className="label-1">
              Reference Number
            </Label>
            <Input
              id="reference"
              placeholder="Payment reference"
              className="body-1"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes" className="label-1">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Additional notes"
              className="body-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="button-1">Record Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}