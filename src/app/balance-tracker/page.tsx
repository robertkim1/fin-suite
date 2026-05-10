"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionInput, TransactionEntity } from "@/types/transaction";
import { BalanceDataRequest, ProjectionDataItem, ProjectionTimeframe, SummarizeDateBy } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TransactionTable from "@/components/balance-tracker/TransactionTable";
import TransactionModal from "@/components/balance-tracker/TransactionModal";
import BalanceChart from "@/components/balance-tracker/BalanceChart";

export default function BalanceTrackerPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionEntity | null>(null);
  const [modalKey, setModalKey] = useState(0);
  const [projectionTimeframe, setProjectionTimeframe] = useState<ProjectionTimeframe>(ProjectionTimeframe.ONE_YEAR);
  const [summarizeDateBy, setSummarizeDateBy] = useState<SummarizeDateBy>(SummarizeDateBy.DAY);
  const [startDate, setStartDate] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [projectionData, setProjectionData] = useState<ProjectionDataItem[]>([]);
  const queryClient = useQueryClient();

  function openModal(tx?: TransactionEntity) {
    setEditing(tx ?? null);
    if (!tx) setModalKey((k) => k + 1);
    setOpen(true);
  }

  const { data: transactions = [], isFetching } = useQuery<TransactionEntity[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch("/api/balance-tracker/transactions");
      if (!res.ok) throw new Error("Failed to load transactions");
      return res.json();
    },
    staleTime: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: async (input: TransactionInput) => {
      const isEdit = Boolean(editing?.id);
      const url = isEdit
        ? `/api/balance-tracker/transactions/${editing!.id}`
        : "/api/balance-tracker/transactions";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setEditing(null);
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/balance-tracker/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  async function submitAll() {
    const request: BalanceDataRequest = {
      transactions,
      currentBalance,
      summarizeDateBy,
      projectionTimeframe,
      startDate,
    };
    const res = await fetch("/api/balance-tracker/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!res.ok) return;
    setProjectionData(await res.json());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center">
        <Button onClick={() => openModal()}>Add Transaction</Button>
        <Button variant="secondary" onClick={submitAll}>Project Balance</Button>
        <Input
          className="w-40"
          placeholder="Current Balance"
          type="number"
          value={currentBalance}
          onChange={(e) => setCurrentBalance(Number(e.target.value))}
        />
        <Select value={projectionTimeframe} onValueChange={(v) => setProjectionTimeframe(v as ProjectionTimeframe)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Timeframe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ProjectionTimeframe.ONE_YEAR}>1 Year</SelectItem>
            <SelectItem value={ProjectionTimeframe.TWO_YEARS}>2 Years</SelectItem>
            <SelectItem value={ProjectionTimeframe.FIVE_YEARS}>5 Years</SelectItem>
          </SelectContent>
        </Select>
        <Select value={summarizeDateBy} onValueChange={(v) => setSummarizeDateBy(v as SummarizeDateBy)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Group by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={SummarizeDateBy.DAY}>Day</SelectItem>
            <SelectItem value={SummarizeDateBy.MONTH}>Month</SelectItem>
            <SelectItem value={SummarizeDateBy.YEAR}>Year</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="w-44"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      {isFetching && <p className="text-muted-foreground text-sm">Refreshing…</p>}

      <TransactionTable
        transactions={transactions}
        onEdit={(tx) => openModal(tx)}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      {projectionData.length > 0 && (
        <div className="mt-4">
          <BalanceChart projectionData={projectionData} />
        </div>
      )}

      <TransactionModal
        key={editing?.id ?? `new-${modalKey}`}
        open={open}
        onOpenChange={setOpen}
        initialData={editing}
        onSave={(tx) => saveMutation.mutate(tx)}
      />
    </div>
  );
}
