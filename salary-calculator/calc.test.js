const assert = require("assert");
const { calcEarnedIncomeDeduction, calcProgressiveTax, calcNetSalary, calcSeverance } = require("./calc.js");

// 근로소득공제: 3천만원은 1,500만~4,500만 구간 -> 750만 + (3000만-1500만)*0.15
assert.strictEqual(calcEarnedIncomeDeduction(30_000_000), 9_750_000);

// 누진세: 2천만원 과세표준 -> 2000만*0.15 - 126만
assert.strictEqual(calcProgressiveTax(20_000_000), 1_740_000);

// 연봉 3600만원, 부양가족 0, 비과세 0 -> 월 실수령액 약 250만원대
const net = calcNetSalary({ grossAnnual: 36_000_000, dependents: 0, nonTaxableMonthly: 0 });
assert.strictEqual(net.monthlyNet, 2_505_440);
assert.ok(net.monthlyNet < net.monthlyGross);

// 퇴직금: 입사 2023-04-01 ~ 퇴사 2026-04-01 (재직 1096일, 2024 윤년 포함)
// 최근 3개월(2026-01-01~04-01, 90일) 급여 900만원 -> 일 평균임금 10만원
const severance = calcSeverance({
  hireDate: "2023-04-01",
  resignDate: "2026-04-01",
  threeMonthWage: 9_000_000,
});
assert.strictEqual(severance.tenureDays, 1096);
assert.strictEqual(severance.avgDailyWage, 100_000);
assert.strictEqual(severance.severance, 9_008_219);

console.log("all calc.js checks passed");
