import { kv } from "@vercel/kv";

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.KV_REST_API_URL) {
  throw new Error("KV não configurado corretamente na Vercel");
}

const localStore: Record<string, any> = {};

export async function getYearlyData(year: number) {
  const key = `finance:${year}`;

  if (!isProduction) {
    console.warn("Usando fallback local (apenas dev)");
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

  if (!isProduction) {
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
