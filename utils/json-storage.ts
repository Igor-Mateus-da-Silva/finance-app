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
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as YearlyData;
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
