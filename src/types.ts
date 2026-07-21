export type Currency = 'ARS' | 'USD';
export type DisplayCurrency = Currency;
export type ExpenseClassification = 'DOCUMENTED' | 'UNDOCUMENTED';

export interface Expense {
  id: string;
  included: boolean;
  date: string;
  name: string;
  classification: ExpenseClassification;
  currency: Currency;
  netAmount: number;
  vatAmount: number;
  vatPerceptionAmount: number;
  grossIncomeAmount: number;
  incomeTaxAmount: number;
  exchangeRate: number | null;
  includeInFiscalNet: boolean;
  notes: string;
}

export interface SaleConfig {
  grossPriceUsd: number;
  vatRate: number;
  grossIncomeRate: number;
  incomeTaxRate: number;
  applyVat: boolean;
  applyGrossIncome: boolean;
  applyIncomeTax: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  referenceExchangeRate: number;
  displayCurrency: DisplayCurrency;
  referenceDate: string;
  sale: SaleConfig;
  expenses: Expense[];
}

export interface AppState {
  scenarios: Scenario[];
  activeScenarioId: string;
}

export interface TaxAmounts {
  vat: number;
  vatPerception: number;
  grossIncome: number;
  incomeTax: number;
}

export interface CalculationResult {
  documentedNetUsd: number;
  documentedGrossUsd: number;
  undocumentedTotalUsd: number;
  totalNetUsd: number;
  totalGrossUsd: number;
  taxesPaidArs: TaxAmounts;
  taxesPaidUsd: TaxAmounts;
  saleNetUsd: number;
  saleVatUsd: number;
  saleGrossIncomeUsd: number;
  profitBeforeIncomeTaxUsd: number;
  estimatedIncomeTaxUsd: number;
  cleanAtlanticProfitUsd: number;
  finalCashResultUsd: number;
  estimatedTaxesArs: TaxAmounts;
  taxBalancePayableArs: TaxAmounts;
  taxBalanceFavorArs: TaxAmounts;
  warnings: string[];
}
