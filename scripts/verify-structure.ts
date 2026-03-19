
import { getYearlyData } from "../lib/storage";

async function verify() {
  const year = 2026;
  console.log(`Checking data for year ${year}...`);
  try {
    const data = await getYearlyData(year);
    console.log("Root Structure:", Object.keys(data));
    console.log("Months count:", Object.keys(data.months).length);
    
    // Check first month structure
    const m1 = data.months["1"];
    console.log("Month 1 Structure:", Object.keys(m1));
    console.log("Month 1 Income Structure:", Object.keys(m1.income));
    console.log("Month 1 Expenses Structure:", Object.keys(m1.expenses));
    console.log("Month 1 Goals defined:", Array.isArray(m1.goals));
    
    if (Array.isArray(m1.goals)) {
      console.log("✅ Month 1 has goals array initialized.");
    } else {
      console.log("❌ Month 1 is missing goals array.");
    }
  } catch (e) {
    console.error("Error during verification:", e);
  }
}

verify();
