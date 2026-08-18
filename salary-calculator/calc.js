// 2024년 기준 4대보험 요율. ponytail: 매년 요율이 바뀌므로 이 4개 상수만 갱신하면 됨.
const NATIONAL_PENSION_RATE = 0.045;
const HEALTH_INSURANCE_RATE = 0.03545;
const LONG_TERM_CARE_RATE = 0.1295; // 건강보험료 대비 비율
const EMPLOYMENT_INSURANCE_RATE = 0.009;

// 근로소득공제 (소득세법 제47조)
function calcEarnedIncomeDeduction(grossAnnual) {
  if (grossAnnual <= 5_000_000) return grossAnnual * 0.7;
  if (grossAnnual <= 15_000_000) return 3_500_000 + (grossAnnual - 5_000_000) * 0.4;
  if (grossAnnual <= 45_000_000) return 7_500_000 + (grossAnnual - 15_000_000) * 0.15;
  if (grossAnnual <= 100_000_000) return 12_000_000 + (grossAnnual - 45_000_000) * 0.05;
  return 14_750_000 + (grossAnnual - 100_000_000) * 0.02;
}

// 종합소득세 누진세율표 (누진공제 방식)
const TAX_BRACKETS = [
  { limit: 14_000_000, rate: 0.06, deduction: 0 },
  { limit: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { limit: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { limit: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { limit: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { limit: 500_000_000, rate: 0.4, deduction: 25_940_000 },
  { limit: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { limit: Infinity, rate: 0.45, deduction: 65_940_000 },
];

function calcProgressiveTax(taxBase) {
  if (taxBase <= 0) return 0;
  const bracket = TAX_BRACKETS.find((b) => taxBase <= b.limit);
  return Math.max(0, taxBase * bracket.rate - bracket.deduction);
}

// 근로소득세 추정치. ponytail: 세액공제(근로소득세액공제 등)는 반영하지 않은
// 간이 추정이라 실제 원천징수액과 차이가 날 수 있음 — UI에 "추정치" 명시 필수.
function calcAnnualIncomeTax(grossAnnual, dependents) {
  const deduction = calcEarnedIncomeDeduction(grossAnnual);
  const earnedIncomeAmount = Math.max(0, grossAnnual - deduction);
  const personalDeduction = 1_500_000 * (1 + dependents);
  const taxBase = Math.max(0, earnedIncomeAmount - personalDeduction);
  return calcProgressiveTax(taxBase);
}

function calcNetSalary({ grossAnnual, dependents = 0, nonTaxableMonthly = 0 }) {
  const nonTaxableAnnual = nonTaxableMonthly * 12;
  const taxableAnnual = Math.max(0, grossAnnual - nonTaxableAnnual);

  const pension = taxableAnnual * NATIONAL_PENSION_RATE;
  const health = taxableAnnual * HEALTH_INSURANCE_RATE;
  const longTermCare = health * LONG_TERM_CARE_RATE;
  const employment = taxableAnnual * EMPLOYMENT_INSURANCE_RATE;
  const incomeTax = calcAnnualIncomeTax(taxableAnnual, dependents);
  const localIncomeTax = incomeTax * 0.1;

  const totalDeduction = pension + health + longTermCare + employment + incomeTax + localIncomeTax;
  const netAnnual = grossAnnual - totalDeduction;

  const perMonth = (v) => Math.round(v / 12);
  return {
    monthlyGross: perMonth(grossAnnual),
    monthlyNet: perMonth(netAnnual),
    pension: perMonth(pension),
    health: perMonth(health),
    longTermCare: perMonth(longTermCare),
    employment: perMonth(employment),
    incomeTax: perMonth(incomeTax),
    localIncomeTax: perMonth(localIncomeTax),
    totalDeductionMonthly: perMonth(totalDeduction),
  };
}

// 퇴직금 (근로자퇴직급여보장법 제8조): 평균임금 × 30일 × (재직일수 / 365)
function calcSeverance({ hireDate, resignDate, threeMonthWage }) {
  const hire = new Date(hireDate);
  const resign = new Date(resignDate);
  const tenureDays = Math.round((resign - hire) / 86_400_000);

  const periodStart = new Date(resign);
  periodStart.setMonth(periodStart.getMonth() - 3);
  const periodDays = Math.round((resign - periodStart) / 86_400_000);

  const avgDailyWage = threeMonthWage / periodDays;
  const severance = avgDailyWage * 30 * (tenureDays / 365);

  return {
    tenureDays,
    avgDailyWage: Math.round(avgDailyWage),
    severance: Math.round(severance),
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calcEarnedIncomeDeduction,
    calcProgressiveTax,
    calcAnnualIncomeTax,
    calcNetSalary,
    calcSeverance,
  };
}
