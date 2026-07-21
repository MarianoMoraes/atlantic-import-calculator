import type { AppState, Expense, Scenario } from '../types';
import { createId } from './id';

const STORAGE_KEY = 'atlantic-house-calculator-v1';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeExpense(value: unknown): Expense | null {
  if (!isObject(value)) return null;
  if (typeof value.name !== 'string') return null;

  return {
    id: typeof value.id === 'string' ? value.id : createId('expense'),
    included: value.included !== false,
    date: typeof value.date === 'string' ? value.date : '',
    name: value.name,
    classification:
      value.classification === 'UNDOCUMENTED'
        ? 'UNDOCUMENTED'
        : 'DOCUMENTED',
    currency: value.currency === 'USD' ? 'USD' : 'ARS',
    netAmount: Number(value.netAmount) || 0,
    vatAmount: Number(value.vatAmount) || 0,
    vatPerceptionAmount: Number(value.vatPerceptionAmount) || 0,
    grossIncomeAmount: Number(value.grossIncomeAmount) || 0,
    incomeTaxAmount: Number(value.incomeTaxAmount) || 0,
    exchangeRate:
      value.exchangeRate === null || value.exchangeRate === undefined
        ? null
        : Number(value.exchangeRate) || null,
    includeInFiscalNet: value.includeInFiscalNet !== false,
    notes: typeof value.notes === 'string' ? value.notes : '',
  };
}

export function normalizeScenario(value: unknown): Scenario | null {
  if (!isObject(value)) return null;
  if (typeof value.name !== 'string') return null;
  if (!Array.isArray(value.expenses)) return null;

  const sale = isObject(value.sale) ? value.sale : {};
  const expenses = value.expenses
    .map(normalizeExpense)
    .filter((expense): expense is Expense => expense !== null);

  return {
    id: typeof value.id === 'string' ? value.id : createId('scenario'),
    name: value.name,
    referenceExchangeRate: Number(value.referenceExchangeRate) || 1450,
    displayCurrency: value.displayCurrency === 'ARS' ? 'ARS' : 'USD',
    referenceDate:
      typeof value.referenceDate === 'string' ? value.referenceDate : '',
    sale: {
      grossPriceUsd: Number(sale.grossPriceUsd) || 0,
      vatRate: Number(sale.vatRate) || 0,
      grossIncomeRate: Number(sale.grossIncomeRate) || 0,
      incomeTaxRate: Number(sale.incomeTaxRate) || 0,
      applyVat: sale.applyVat !== false,
      applyGrossIncome: sale.applyGrossIncome !== false,
      applyIncomeTax: sale.applyIncomeTax !== false,
    },
    expenses,
  };
}

export function loadState(fallback: AppState): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed) || !Array.isArray(parsed.scenarios)) return fallback;

    const scenarios = parsed.scenarios
      .map(normalizeScenario)
      .filter((scenario): scenario is Scenario => scenario !== null);
    if (scenarios.length === 0) return fallback;

    const activeScenarioId =
      typeof parsed.activeScenarioId === 'string' &&
      scenarios.some((scenario) => scenario.id === parsed.activeScenarioId)
        ? parsed.activeScenarioId
        : scenarios[0]!.id;

    return { scenarios, activeScenarioId };
  } catch {
    return fallback;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
