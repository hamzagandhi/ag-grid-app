import type {   Entry } from "./utils/types";

export function createEntries(count: number): Entry[] {
  const years = [2025, 2024, 2023, 2022];
  const randomAmount = (min = 0, max = 50000) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const randomName = (prefix: string) =>
    `${prefix} ${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return Array.from({ length: count }, (_, i) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yearData: Record<number, any> = {};
    for (const year of years) {
      const total = randomAmount(1000, 50000);
      yearData[year] = {
        total_amount: total,
        acc1: { amount: randomAmount(0, total), isBilled: true },
        acc2: { amount: randomAmount(0, total), isBilled: true },
        acc3: { amount: randomAmount(0, total), isBilled: true },
        acc4: { amount: randomAmount(0, total), isBilled: true },
      };
    }
    return {
      service: { _id: `srv_${i + 1}`, name: randomName("Service") },
      act: { _id: `act_${i + 1}`, name: randomName("Act") },
      quote: "Sample Quote",
      remarks: "Sample Remarks",
      yearData,
    };
  });
}
