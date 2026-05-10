import { TransactionEntity } from "./transaction";

export enum ProjectionTimeframe {
  ONE_YEAR = "ONE_YEAR",
  TWO_YEARS = "TWO_YEARS",
  FIVE_YEARS = "FIVE_YEARS",
}

export enum SummarizeDateBy {
  DAY = "DAY",
  MONTH = "MONTH",
  YEAR = "YEAR",
}

export type BalanceDataRequest = {
  transactions: TransactionEntity[];
  currentBalance: number;
  summarizeDateBy: SummarizeDateBy;
  startDate: string;
  projectionTimeframe: ProjectionTimeframe;
};

export type ProjectionDataPoint = {
  balance: number;
  transactionList: TransactionEntity[];
};

export type ProjectionDataItem = {
  dataPoint: ProjectionDataPoint;
  date: string;
};
