import type { Entry } from "./types";

export function createEntries(count: number): Entry[] {
  const years = [2025, 2024, 2023, 2022];

  const randomAmount = (min = 0, max = 50000) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const randomName = (prefix: string) =>
    `${prefix} ${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const services = Array.from({ length: count }, (_, i) => ({
    _id: `srv_${i + 1}`,           
    name: randomName("Service"),
  }));

  const acts = Array.from({ length: count }, (_, i) => ({
    _id: `act_${i + 1}`,            
    name: randomName("Act"),
  }));

  const templateYearData = () =>
    years.reduce((acc, year) => {
      const total = randomAmount(1000, 50000);
      acc[year] = {
        total_amount: total,
        acc1: { amount: randomAmount(0, total), isBilled: true },
        acc2: { amount: randomAmount(0, total), isBilled: true },
        acc3: { amount: randomAmount(0, total), isBilled: true },
        acc4: { amount: randomAmount(0, total), isBilled: true },
      };
      return acc;
    }, {} as Entry["yearData"]);

  return Array.from({ length: count }, (_, i) => ({
    service: services[i],
    act: acts[i],
    quote: "",
    remarks: "",
    yearData: templateYearData(),
  }));
}
