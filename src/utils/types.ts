// src/utils/types.ts
export interface Service {
  _id: string;
  name: string;
}

export interface Act {
  _id: string;
  name: string;
}

export interface AccountData {
  amount?: number;
  isBilled?: boolean;
}

export interface YearData {
  total_amount?: number;
  acc1?: AccountData;
  acc2?: AccountData;
  acc3?: AccountData;
  acc4?: AccountData;
}

export interface Entry {
  service: Service;
  act: Act;
  quote: string;
  remarks: string;
  yearData: Record<number, YearData>;
}

export interface FlattenedRow {
  __rowIndex: number;
  serviceName: string;
  actName: string;
  quote: string;
  remarks: string;
  [key: string]: string | number | boolean | null;
}
