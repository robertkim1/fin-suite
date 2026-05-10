import { TransactionEntity, TransactionType, PayPeriod } from "@/types/transaction";
import { BalanceDataRequest, ProjectionDataItem, SummarizeDateBy, ProjectionTimeframe } from "@/types/dashboard";

const MAX_TRANSACTIONS = 1000;
const MAX_TRANSACTIONS_PER_DATE = 100;

const TIMEFRAME_YEARS: Record<ProjectionTimeframe, number> = {
  [ProjectionTimeframe.ONE_YEAR]: 1,
  [ProjectionTimeframe.TWO_YEARS]: 2,
  [ProjectionTimeframe.FIVE_YEARS]: 5,
};

type QueuedTransaction = TransactionEntity & { dateObj: Date };

export function getBalanceSummary(request: BalanceDataRequest): ProjectionDataItem[] {
  const startDate = parseDate(request.startDate);
  validateRequest(request, startDate);

  const years = TIMEFRAME_YEARS[request.projectionTimeframe];
  const endDate = addYears(startDate, years);

  const queue: QueuedTransaction[] = request.transactions
    .map((t) => ({ ...t, dateObj: parseDate(t.date) }))
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  const output: ProjectionDataItem[] = [];
  let currDate = new Date(startDate);
  let currBalance = request.currentBalance;

  while (currDate.getTime() <= endDate.getTime()) {
    const result = processQueue(queue, currDate, currBalance);
    if (result.transactions.length > 0) {
      currBalance = result.balance;
    }
    output.push({
      dataPoint: { balance: currBalance, transactionList: result.transactions },
      date: formatDate(currDate),
    });
    currDate = incrementDate(currDate, request.summarizeDateBy);
  }

  return output;
}

function processQueue(
  queue: QueuedTransaction[],
  currDate: Date,
  currBalance: number
): { balance: number; transactions: TransactionEntity[] } {
  const processed: TransactionEntity[] = [];
  let balance = currBalance;
  let count = 0;

  while (queue.length > 0 && queue[0].dateObj.getTime() <= currDate.getTime()) {
    if (++count > MAX_TRANSACTIONS_PER_DATE) {
      throw new Error(`Too many transactions on the same date: ${formatDate(currDate)}`);
    }
    const tx = queue.shift()!;
    const { dateObj: _dateObj, ...txEntity } = tx;
    processed.push(txEntity);
    balance += tx.type === TransactionType.INCOME ? tx.amount : -tx.amount;

    const nextDate = nextOccurrence(tx.dateObj, tx.payPeriod);
    const nextTx: QueuedTransaction = { ...tx, dateObj: nextDate, date: formatDate(nextDate) };
    insertSorted(queue, nextTx);
  }

  return { balance, transactions: processed };
}

function insertSorted(queue: QueuedTransaction[], tx: QueuedTransaction) {
  let i = queue.length;
  while (i > 0 && queue[i - 1].dateObj.getTime() > tx.dateObj.getTime()) i--;
  queue.splice(i, 0, tx);
}

function nextOccurrence(date: Date, payPeriod: PayPeriod): Date {
  switch (payPeriod) {
    case PayPeriod.WEEKLY:
      return addDays(date, 7);
    case PayPeriod.SEMIMONTHLY:
      return findNext1stOr15th(date);
    case PayPeriod.MONTHLY:
      return addMonths(date, 1);
    default:
      throw new Error(`Unknown pay period: ${payPeriod}`);
  }
}

function findNext1stOr15th(date: Date): Date {
  const result = new Date(date);
  if (date.getDate() < 15) {
    result.setDate(15);
  } else {
    result.setMonth(result.getMonth() + 1);
    result.setDate(1);
  }
  return result;
}

function incrementDate(date: Date, by: SummarizeDateBy): Date {
  switch (by) {
    case SummarizeDateBy.DAY:
      return addDays(date, 1);
    case SummarizeDateBy.MONTH:
      return addMonths(date, 1);
    case SummarizeDateBy.YEAR:
      return addYears(date, 1);
    default:
      throw new Error(`Unknown summarize mode: ${by}`);
  }
}

function validateRequest(request: BalanceDataRequest, startDate: Date) {
  if (!request.transactions) throw new Error("Transactions cannot be null");
  if (request.transactions.length > MAX_TRANSACTIONS) {
    throw new Error(`Too many transactions. Max: ${MAX_TRANSACTIONS}`);
  }
  if (isNaN(startDate.getTime())) throw new Error("Invalid start date");
  for (const tx of request.transactions) {
    if (!tx.sourceName?.trim()) throw new Error("Transaction source name cannot be empty");
    if (tx.amount < 0) throw new Error(`Amount cannot be negative: ${tx.sourceName}`);
    const txDate = parseDate(tx.date);
    if (startDate.getTime() > txDate.getTime()) {
      throw new Error(`Transaction date before start date: ${tx.sourceName}`);
    }
  }
}

function parseDate(s: string): Date {
  const [year, month, day] = s.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

function addYears(d: Date, n: number): Date {
  const r = new Date(d);
  r.setFullYear(r.getFullYear() + n);
  return r;
}
