export type TransactionInput = {
  sourceName: string;
  amount: number;
  date: string;
  type: TransactionType;
  payPeriod: PayPeriod;
};

export type TransactionEntity = TransactionInput & {
  id: string;
};

export enum TransactionType {
  INCOME = "INCOME",
  DEBT = "DEBT",
}

export enum PayPeriod {
  WEEKLY = "WEEKLY",
  SEMIMONTHLY = "SEMIMONTHLY",
  MONTHLY = "MONTHLY",
}
