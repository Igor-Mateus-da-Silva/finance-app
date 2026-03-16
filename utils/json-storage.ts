import fs from "fs/promises";
import path from "path";
import { YearlyData, MonthData } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Ignore error if exists
  }
}

export async function getYearlyData(year: number): Promise<YearlyData> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${year}.json`);

  try {
    const data = JSON.parse(await fs.readFile(filePath, "utf-8")) as YearlyData;
    
    // Ensure all 12 months are initialized if they exist or not in the JSON
    for (let i = 1; i <= 12; i++) {
      const m = i.toString();
      if (!data.months[m]) {
        data.months[m] = {
          income: { salary: 0, vr: 0, extra: [] },
          expenses: { essential_fixed: [], nonessential_fixed: [], variable: [] },
          goals: [],
        };
      } else {
        // Ensure sub-structures exist for existing months
        data.months[m].income ??= { salary: 0, vr: 0, extra: [] };
        data.months[m].income.extra ??= [];
        data.months[m].expenses ??= { essential_fixed: [], nonessential_fixed: [], variable: [] };
        data.months[m].expenses.essential_fixed ??= [];
        data.months[m].expenses.nonessential_fixed ??= [];
        data.months[m].expenses.variable ??= [];
        data.months[m].goals ??= [];
      }
    }
    return data;
  } catch (error) {
    // If file doesn't exist, create an empty structure for the year
    const emptyYear: YearlyData = {
      year,
      months: {},
    };

    // Initialize all 12 months empty to avoid undefined checks constantly
    for (let i = 1; i <= 12; i++) {
      emptyYear.months[i.toString()] = {
        income: { salary: 0, vr: 0, extra: [] },
        expenses: { essential_fixed: [], nonessential_fixed: [], variable: [] },
        goals: [],
      };
    }
    await saveYearlyData(year, emptyYear);
    return emptyYear;
  }
}

export async function saveYearlyData(
  year: number,
  data: YearlyData,
): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${year}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
