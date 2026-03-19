import { kv } from "@vercel/kv";

let isKVAvailable = true;

try {
  if (!process.env.KV_REST_API_URL) {
    isKVAvailable = false;
  }
} catch {
  isKVAvailable = false;
}

const localStore: Record<string, any> = {};

export async function getYearlyData(year: number) {
  const key = `finance:${year}`;

  if (!isKVAvailable) {
    if (!localStore[key]) {
      localStore[key] = {
        year,
        months: {},
      };
    }
    return localStore[key];
  }

  let data: any = await kv.get(key);

  if (!data) {
    data = {
      year,
      months: {},
    };

    await kv.set(key, data);
  }

  return data;
}

export async function saveYearlyData(year: number, data: any) {
  const key = `finance:${year}`;

  if (!isKVAvailable) {
    localStore[key] = data;
    return;
  }

  await kv.set(key, data);
}

export function ensureMonthExists(data: any, month: string) {
  if (!data.months[month]) {
    data.months[month] = {
      income: {
        salary: 0,
        vr: 0,
        extra: [],
      },
      expenses: {
        essential_fixed: [],
        nonessential_fixed: [],
        variable: [],
      },
      goals: [],
    };
  }
}
