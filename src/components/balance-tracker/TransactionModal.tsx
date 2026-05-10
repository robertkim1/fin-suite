"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionInput, TransactionEntity, TransactionType, PayPeriod } from "@/types/transaction";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: TransactionEntity | null;
  onSave: (tx: TransactionInput) => void;
}

export default function TransactionModal({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<TransactionInput>({
    sourceName: initialData?.sourceName ?? "",
    amount: initialData?.amount ?? 0,
    date: initialData?.date ?? "",
    type: initialData?.type ?? TransactionType.INCOME,
    payPeriod: initialData?.payPeriod ?? PayPeriod.WEEKLY,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Source name"
            value={form.sourceName}
            onChange={(e) => setForm((f) => ({ ...f, sourceName: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
          />
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as TransactionType }))}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={TransactionType.INCOME}>Income</SelectItem>
              <SelectItem value={TransactionType.DEBT}>Debt</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.payPeriod} onValueChange={(v) => setForm((f) => ({ ...f, payPeriod: v as PayPeriod }))}>
            <SelectTrigger><SelectValue placeholder="Pay period" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={PayPeriod.WEEKLY}>Weekly</SelectItem>
              <SelectItem value={PayPeriod.SEMIMONTHLY}>Semimonthly</SelectItem>
              <SelectItem value={PayPeriod.MONTHLY}>Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={() => onSave(form)}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
