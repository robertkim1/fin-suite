import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TransactionEntity } from "@/types/transaction";

interface Props {
  transactions: TransactionEntity[];
  onEdit: (tx: TransactionEntity) => void;
  onDelete: (id: string) => void;
}

export default function TransactionTable({ transactions, onEdit, onDelete }: Props) {
  if (transactions.length === 0) {
    return <p className="text-muted-foreground text-sm py-4">No transactions yet. Add one to get started.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Pay Period</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>{tx.sourceName}</TableCell>
            <TableCell>${Number(tx.amount).toLocaleString()}</TableCell>
            <TableCell>{tx.date}</TableCell>
            <TableCell>{tx.type}</TableCell>
            <TableCell>{tx.payPeriod}</TableCell>
            <TableCell className="flex gap-2">
              <Button size="sm" onClick={() => onEdit(tx)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(tx.id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
