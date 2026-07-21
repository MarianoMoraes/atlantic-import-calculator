import type { CalculationResult, Expense, Scenario, TaxAmounts } from '../types';

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function expenseGrossAmount(expense: Expense): number {
  return (
    expense.netAmount +
    expense.vatAmount +
    expense.vatPerceptionAmount +
    expense.grossIncomeAmount +
    expense.incomeTaxAmount
  );
}

function effectiveExchangeRate(expense: Expense, referenceRate: number): number {
  const rate = expense.exchangeRate ?? referenceRate;
  return rate > 0 ? rate : 0;
}

export function amountToUsd(
  amount: number,
  expense: Expense,
  referenceRate: number,
): number {
  if (expense.currency === 'USD') return amount;
  const rate = effectiveExchangeRate(expense, referenceRate);
  return rate > 0 ? amount / rate : 0;
}

export function amountToArs(
  amount: number,
  expense: Expense,
  referenceRate: number,
): number {
  if (expense.currency === 'ARS') return amount;
  const rate = effectiveExchangeRate(expense, referenceRate);
  return rate > 0 ? amount * rate : 0;
}

export function expenseNetUsd(expense: Expense, referenceRate: number): number {
  return amountToUsd(expense.netAmount, expense, referenceRate);
}

export function expenseGrossUsd(expense: Expense, referenceRate: number): number {
  return amountToUsd(expenseGrossAmount(expense), expense, referenceRate);
}

function emptyTaxes(): TaxAmounts {
  return { vat: 0, vatPerception: 0, grossIncome: 0, incomeTax: 0 };
}

function taxAmountsFromExpenses(
  expenses: Expense[],
  referenceRate: number,
  target: 'ARS' | 'USD',
): TaxAmounts {
  return expenses.reduce<TaxAmounts>((acc, expense) => {
    const convert = target === 'ARS' ? amountToArs : amountToUsd;
    acc.vat += convert(expense.vatAmount, expense, referenceRate);
    acc.vatPerception += convert(
      expense.vatPerceptionAmount,
      expense,
      referenceRate,
    );
    acc.grossIncome += convert(
      expense.grossIncomeAmount,
      expense,
      referenceRate,
    );
    acc.incomeTax += convert(expense.incomeTaxAmount, expense, referenceRate);
    return acc;
  }, emptyTaxes());
}

function taxDifferencePositive(a: TaxAmounts, b: TaxAmounts): TaxAmounts {
  return {
    vat: Math.max(a.vat - b.vat, 0),
    vatPerception: Math.max(a.vatPerception - b.vatPerception, 0),
    grossIncome: Math.max(a.grossIncome - b.grossIncome, 0),
    incomeTax: Math.max(a.incomeTax - b.incomeTax, 0),
  };
}

export function calculateScenario(scenario: Scenario): CalculationResult {
  const included = scenario.expenses.filter((expense) => expense.included);
  const documented = included.filter(
    (expense) => expense.classification === 'DOCUMENTED',
  );
  const undocumented = included.filter(
    (expense) => expense.classification === 'UNDOCUMENTED',
  );

  const documentedNetUsd = sum(
    documented
      .filter((expense) => expense.includeInFiscalNet)
      .map((expense) => expenseNetUsd(expense, scenario.referenceExchangeRate)),
  );
  const documentedGrossUsd = sum(
    documented.map((expense) =>
      expenseGrossUsd(expense, scenario.referenceExchangeRate),
    ),
  );
  const undocumentedTotalUsd = sum(
    undocumented.map((expense) =>
      expenseGrossUsd(expense, scenario.referenceExchangeRate),
    ),
  );

  const totalNetUsd = documentedNetUsd + undocumentedTotalUsd;
  const totalGrossUsd = documentedGrossUsd + undocumentedTotalUsd;

  const vatRate = scenario.sale.applyVat ? scenario.sale.vatRate / 100 : 0;
  const grossIncomeRate = scenario.sale.applyGrossIncome
    ? scenario.sale.grossIncomeRate / 100
    : 0;
  const incomeTaxRate = scenario.sale.applyIncomeTax
    ? scenario.sale.incomeTaxRate / 100
    : 0;

  const saleNetUsd =
    vatRate > 0
      ? scenario.sale.grossPriceUsd / (1 + vatRate)
      : scenario.sale.grossPriceUsd;
  const saleVatUsd = scenario.sale.grossPriceUsd - saleNetUsd;
  const saleGrossIncomeUsd = saleNetUsd * grossIncomeRate;
  const profitBeforeIncomeTaxUsd =
    saleNetUsd - documentedNetUsd - saleGrossIncomeUsd;
  const estimatedIncomeTaxUsd = profitBeforeIncomeTaxUsd * incomeTaxRate;
  const cleanAtlanticProfitUsd =
    profitBeforeIncomeTaxUsd - estimatedIncomeTaxUsd;
  const finalCashResultUsd = cleanAtlanticProfitUsd - undocumentedTotalUsd;

  const taxesPaidArs = taxAmountsFromExpenses(
    included,
    scenario.referenceExchangeRate,
    'ARS',
  );
  const taxesPaidUsd = taxAmountsFromExpenses(
    included,
    scenario.referenceExchangeRate,
    'USD',
  );
  const estimatedTaxesArs: TaxAmounts = {
    vat: saleVatUsd * scenario.referenceExchangeRate,
    vatPerception: 0,
    grossIncome: saleGrossIncomeUsd * scenario.referenceExchangeRate,
    incomeTax: estimatedIncomeTaxUsd * scenario.referenceExchangeRate,
  };

  const taxBalancePayableArs = taxDifferencePositive(
    estimatedTaxesArs,
    taxesPaidArs,
  );
  const taxBalanceFavorArs = taxDifferencePositive(
    taxesPaidArs,
    estimatedTaxesArs,
  );

  const warnings: string[] = [];
  const missingExchangeRates = included.filter(
    (expense) =>
      expense.currency === 'ARS' &&
      (expense.exchangeRate === null || expense.exchangeRate <= 0),
  );
  if (missingExchangeRates.length > 0) {
    warnings.push(
      `${missingExchangeRates.length} gasto(s) en ARS usan el dólar de referencia por no tener tipo de cambio propio.`,
    );
  }
  const excludedFromFiscalNet = documented.filter(
    (expense) => !expense.includeInFiscalNet,
  );
  if (excludedFromFiscalNet.length > 0) {
    warnings.push(
      `${excludedFromFiscalNet.length} gasto(s) documentado(s) no computan en el costo neto fiscal.`,
    );
  }
  if (scenario.referenceExchangeRate <= 0) {
    warnings.push('El dólar de referencia debe ser mayor que cero.');
  }
  if (scenario.sale.grossPriceUsd <= 0) {
    warnings.push('El precio de venta bruto no está definido.');
  }

  return {
    documentedNetUsd,
    documentedGrossUsd,
    undocumentedTotalUsd,
    totalNetUsd,
    totalGrossUsd,
    taxesPaidArs,
    taxesPaidUsd,
    saleNetUsd,
    saleVatUsd,
    saleGrossIncomeUsd,
    profitBeforeIncomeTaxUsd,
    estimatedIncomeTaxUsd,
    cleanAtlanticProfitUsd,
    finalCashResultUsd,
    estimatedTaxesArs,
    taxBalancePayableArs,
    taxBalanceFavorArs,
    warnings,
  };
}
