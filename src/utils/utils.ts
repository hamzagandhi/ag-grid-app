/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Entry, FlattenedRow } from "./types";

export const YEARS = [2022,2023,2024,2025] as const;

export function flattenRow(entry: Entry, index: number): FlattenedRow {
  const row: FlattenedRow = {
    __rowIndex: index,
    serviceName: entry.service.name,
    actName: entry.act.name,
    quote: entry.quote,
    remarks: entry.remarks,
  };

  for (const year of YEARS) {
    const data = entry.yearData[year] || {};
    row[`y${year}_total`] = data.total_amount ?? 0;
    row[`y${year}_acc1`] = data.acc1?.amount ?? 0;
    row[`y${year}_acc2`] = data.acc2?.amount ?? 0;
    row[`y${year}_acc3`] = data.acc3?.amount ?? 0;
    row[`y${year}_acc4`] = data.acc4?.amount ?? 0;
    row[`y${year}_diff`] =
      (data.total_amount ?? 0) -
      ((data.acc1?.amount ?? 0) +
        (data.acc2?.amount ?? 0) +
        (data.acc3?.amount ?? 0) +
        (data.acc4?.amount ?? 0));
  }

  return row;
}

export function unflattenRows(rows: FlattenedRow[]): Entry[] {
  return rows.map((row) => {
    const yearData: Record<number, any> = {};
    for (const year of YEARS) {
      yearData[year] = {
        total_amount: row[`y${year}_total`] as number,
        acc1: { amount: row[`y${year}_acc1`] as number, isBilled: true },
        acc2: { amount: row[`y${year}_acc2`] as number, isBilled: true },
        acc3: { amount: row[`y${year}_acc3`] as number, isBilled: true },
        acc4: { amount: row[`y${year}_acc4`] as number, isBilled: true },
      };
    }

    return {
      service: { _id: "", name: row.serviceName },
      act: { _id: "", name: row.actName },
      quote: row.quote,
      remarks: row.remarks,
      yearData,
    };
  });
}
