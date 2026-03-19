"use server";

import { saveYearlyData } from "@/lib/storage";
import { YearlyData } from "@/types";
import { revalidatePath } from "next/cache";

export async function importYearlyData(year: number, dataStr: string) {
  try {
    const data = JSON.parse(dataStr) as YearlyData;

    if (data.year !== year) {
      throw new Error("O ano do arquivo não corresponde ao ano selecionado.");
    }
    if (!data.months) {
      throw new Error("Arquivo inválido. Faltam dados dos meses.");
    }

    await saveYearlyData(year, data);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erro desconhecido" };
  }
}
