export interface Rule503020Result {
  essential: {
    ideal: number;
    actual: number;
    difference: number;
    status: "ok" | "warning" | "danger";
    percentage: number;
  };
  nonessential: {
    ideal: number;
    actual: number;
    difference: number;
    status: "ok" | "warning" | "danger";
    percentage: number;
  };
  savings: {
    ideal: number; // For savings/investments, this is the MINIMUM ideal. 20%
    actual: number; // Leftover balance basically (or tracked savings, but balance is a proxy)
    difference: number;
    status: "ok" | "warning" | "danger";
    percentage: number;
  };
}

export function calculate503020(
  totalIncome: number,
  essentialExpenses: number,
  nonessentialExpenses: number,
  variableExpenses: number,
): Rule503020Result {
  // 50% for Needs (Essential Fixed)
  const idealEssential = totalIncome * 0.5;
  // 30% for Wants (Nonessential Fixed + Variable)
  const idealNonessential = totalIncome * 0.3;
  // 20% for Savings/Investments
  const idealSavings = totalIncome * 0.2;

  const totalWants = nonessentialExpenses + variableExpenses;
  // Actual savings is basically whatever is left. If user saves manually, this simplifies it to "what wasn't spent".
  const actualSavings = totalIncome - essentialExpenses - totalWants;

  const getStatus = (
    ideal: number,
    actual: number,
    type: "expense" | "savings",
  ) => {
    if (type === "expense") {
      if (actual <= ideal) return "ok";
      if (actual <= ideal * 1.1) return "warning"; // 10% tolerance
      return "danger";
    } else {
      // For savings, actual < ideal is bad.
      if (actual >= ideal) return "ok";
      if (actual >= ideal * 0.5) return "warning"; // saved at least half of the goal
      return "danger";
    }
  };

  return {
    essential: {
      ideal: idealEssential,
      actual: essentialExpenses,
      difference: idealEssential - essentialExpenses,
      status: getStatus(idealEssential, essentialExpenses, "expense"),
      percentage: totalIncome > 0 ? (essentialExpenses / totalIncome) * 100 : 0,
    },
    nonessential: {
      ideal: idealNonessential,
      actual: totalWants,
      difference: idealNonessential - totalWants,
      status: getStatus(idealNonessential, totalWants, "expense"),
      percentage: totalIncome > 0 ? (totalWants / totalIncome) * 100 : 0,
    },
    savings: {
      ideal: idealSavings,
      actual: actualSavings,
      difference: actualSavings - idealSavings,
      status: getStatus(idealSavings, actualSavings, "savings"),
      percentage: totalIncome > 0 ? (actualSavings / totalIncome) * 100 : 0,
    },
  };
}
